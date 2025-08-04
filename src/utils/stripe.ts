import Stripe from 'stripe';
import { ResponseHelper } from './response';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export { stripe };

// Interface for payment intent creation
export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  reservationId: string;
  userId: string;
}

// Interface for webhook event
export interface StripeWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: {
        reservationId?: string;
      };
      status?: string;
    };
  };
}

/**
 * Creates a payment intent for a reservation
 */
export const createPaymentIntent = async (data: CreatePaymentIntentRequest) => {
  try {
    const { amount, currency, reservationId, userId } = data;

    // Validate amount (must be positive)
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        reservationId,
        userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Validates Stripe webhook signature
 */
export const validateWebhookSignature = (
  payload: string,
  signature: string,
  endpointSecret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

/**
 * Processes successful payment
 */
export const processSuccessfulPayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent.metadata?.reservationId) {
      throw new Error('No reservation ID found in payment metadata');
    }

    return {
      reservationId: paymentIntent.metadata.reservationId,
      userId: paymentIntent.metadata.userId,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
    };
  } catch (error) {
    console.error('Error processing successful payment:', error);
    throw error;
  }
};

/**
 * Processes failed payment
 */
export const processFailedPayment = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent.metadata?.reservationId) {
      throw new Error('No reservation ID found in payment metadata');
    }

    return {
      reservationId: paymentIntent.metadata.reservationId,
      userId: paymentIntent.metadata.userId,
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
    };
  } catch (error) {
    console.error('Error processing failed payment:', error);
    throw error;
  }
}; 