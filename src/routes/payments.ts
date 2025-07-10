import { Router, RequestHandler } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ResponseHelper } from '../utils/response';
import {
  createPaymentIntent,
  validateWebhookSignature,
  processSuccessfulPayment,
  processFailedPayment,
  CreatePaymentIntentRequest,
} from '../utils/stripe';
import Reservation from '../models/Reservation';
import { RESERVATION_STATUS } from '../types';
import { logChanges } from '../utils/auditLogger';

const router = Router();

// POST /payments/create-payment-intent - Create payment intent for a reservation
const createPaymentIntentHandler: RequestHandler = async (req, res, next) => {
  try {
    const { amount, currency, reservationId }: CreatePaymentIntentRequest =
      req.body;

    // Validate required fields
    if (!amount || !currency || !reservationId) {
      ResponseHelper.validationError(
        res,
        'Faltan parámetros requeridos: amount, currency, reservationId'
      );
      return;
    }

    // Validate amount
    if (amount <= 0) {
      ResponseHelper.validationError(res, 'El monto debe ser mayor a 0');
      return;
    }

    // Validate currency
    const validCurrencies = ['usd', 'ars', 'eur'];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      ResponseHelper.validationError(
        res,
        'Moneda no válida. Use: usd, ars, o eur'
      );
      return;
    }

    // Find the reservation by ID
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    // Check if reservation belongs to the user
    if (reservation.user.toString() !== req.user?._id.toString()) {
      ResponseHelper.forbidden(
        res,
        'No tienes permiso para pagar esta reserva (no eres el dueño)'
      );
      return;
    }

    // Check if reservation is payment pending
    if (reservation.status !== RESERVATION_STATUS.PAYMENT_PENDING) {
      ResponseHelper.validationError(
        res,
        'La reserva no está pendiente de pago'
      );
      return;
    }

    // Validate that the amount matches the reservation total
    if (Math.abs(amount - reservation.totalPrice) > 0.01) {
      ResponseHelper.validationError(
        res,
        'El monto no coincide con el precio total de la reserva'
      );
      return;
    }

    // Create payment intent
    const paymentData = await createPaymentIntent({
      amount,
      currency,
      reservationId,
      userId: req.user?._id.toString() || '',
    });

    ResponseHelper.success(res, 'Payment intent creado exitosamente', {
      clientSecret: paymentData.clientSecret,
      paymentIntentId: paymentData.paymentIntentId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    next(error);
  }
};

// POST /payments/webhook - Stripe webhook handler
const stripeWebhookHandler: RequestHandler = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !endpointSecret) {
      console.error('Missing stripe signature or webhook secret');
      res.status(400).json({ error: 'Invalid webhook' });
      return;
    }

    // Validate webhook signature
    let event;
    try {
      event = validateWebhookSignature(req.body, signature, endpointSecret);
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    next(error);
  }
};

// Helper function to handle successful payments
const handlePaymentSuccess = async (event: any) => {
  try {
    const paymentData = await processSuccessfulPayment(event.data.object.id);

    // Update reservation status to waiting_acceptance (waiting for caregiver approval)
    const reservation = await Reservation.findByIdAndUpdate(
      paymentData.reservationId,
      {
        status: RESERVATION_STATUS.WAITING_ACCEPTANCE,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (reservation) {
      // Log the change
      await logChanges(
        'Reservation',
        (reservation._id as any).toString(),
        'system',
        'Payment System',
        [
          {
            field: 'status',
            oldValue: RESERVATION_STATUS.PAYMENT_PENDING,
            newValue: RESERVATION_STATUS.WAITING_ACCEPTANCE,
          },
          {
            field: 'paymentAmount',
            oldValue: null,
            newValue: paymentData.amount,
          },
          {
            field: 'paymentCurrency',
            oldValue: null,
            newValue: paymentData.currency,
          },
        ]
      );

      console.log(
        `Reservation ${paymentData.reservationId} payment successful, waiting for caregiver acceptance`
      );
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};

// Helper function to handle failed payments
const handlePaymentFailure = async (event: any) => {
  try {
    const paymentData = await processFailedPayment(event.data.object.id);

    // Update reservation status to payment rejected
    const reservation = await Reservation.findByIdAndUpdate(
      paymentData.reservationId,
      {
        status: RESERVATION_STATUS.PAYMENT_REJECTED,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (reservation) {
      // Log the change
      await logChanges(
        'Reservation',
        (reservation._id as any).toString(),
        'system',
        'Payment System',
        [
          {
            field: 'status',
            oldValue: RESERVATION_STATUS.PAYMENT_PENDING,
            newValue: RESERVATION_STATUS.PAYMENT_REJECTED,
          },
          {
            field: 'failureReason',
            oldValue: null,
            newValue: paymentData.failureReason,
          },
        ]
      );

      console.log(
        `Reservation ${paymentData.reservationId} rejected due to payment failure`
      );
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
};

// GET /payments/status/:reservationId - Get payment status for a reservation
const getPaymentStatus: RequestHandler = async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      ResponseHelper.validationError(res, 'ID de reserva requerido');
      return;
    }

    // Find the reservation
    const reservation = await Reservation.findOne({
      _id: reservationId,
      user: req.user?._id,
    });

    if (!reservation) {
      ResponseHelper.notFound(res, 'Reserva no encontrada');
      return;
    }

    ResponseHelper.success(res, 'Estado de pago obtenido', {
      reservationId: reservation._id as any,
      status: reservation.status,
      totalPrice: reservation.totalPrice,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    next(error);
  }
};

// Routes
router.post(
  '/create-payment-intent',
  authMiddleware,
  createPaymentIntentHandler
);
router.post('/webhook', stripeWebhookHandler);
router.get('/status/:reservationId', authMiddleware, getPaymentStatus);

export default router;
