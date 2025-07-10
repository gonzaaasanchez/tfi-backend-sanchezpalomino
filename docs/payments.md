# Payment System - TFI Backend

## Overview

The payment system allows processing reservation payments using Stripe. Reservations are created with the `payment_pending` status and are only confirmed after a successful payment and caregiver approval.

## Payment Flow

### 1. Reservation Creation
- **Endpoint**: `POST /api/reservations`
- **Initial status**: `payment_pending`
- **Description**: Creates a reservation pending payment

### 2. Payment Intent Creation
- **Endpoint**: `POST /api/payments/create-payment-intent`
- **Authentication**: Required
- **Body**:
```json
{
  "amount": 100.50,
  "currency": "ars",
  "reservationId": "reservation_id_here"
}
```

### 3. Payment Processing
- **Frontend**: Processes the payment with Stripe
- **Webhook**: Stripe notifies the backend about the payment result

### 4. Stripe Webhook
- **Endpoint**: `POST /api/payments/webhook`
- **Description**: Receives notifications from Stripe about the payment status
- **Successful payment**: Changes status to `waiting_acceptance` (waiting for caregiver approval)
- **Failed payment**: Changes status to `payment_rejected`

### 5. Caregiver Approval
- **Endpoint**: `POST /api/reservations/:id/accept`
- **Final status**: `confirmed` (reservation confirmed)

### 6. Status Check
- **Endpoint**: `GET /api/payments/status/:reservationId`
- **Authentication**: Required

## Reservation Statuses

- `payment_pending`: Reservation created, pending payment
- `waiting_acceptance`: Payment successful, waiting for caregiver approval
- `payment_rejected`: Payment failed, reservation rejected

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Stripe Setup

1. Create a Stripe account
2. Obtain API keys (test/production)
3. Configure the webhook endpoint
4. Get the webhook secret

## Security

- Webhook signature validation
- Reservation ownership verification
- Amount validation
- Change logging 