# 📧 Email System

The application includes a complete email system powered by **Resend** for professional email delivery.

## 🚀 Features

- **Password Recovery**: Automated email with reset codes
- **Reservation Notifications**: Automatic emails for reservation status changes
- **Professional Templates**: HTML-formatted emails with styling
- **Security**: 15-minute expiration for reset codes
- **Error Handling**: Comprehensive error management
- **Domain Verification**: Support for custom domains
- **Rate Limiting**: Built-in protection against spam

## 🛠️ Setup

### 1. Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Navigate to the [API Keys section](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)

### 3. Configure Environment Variables
Add these to your `.env` file:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_your-api-key-here
FROM_EMAIL=onboarding@resend.dev

# Optional: Custom domain (must be verified in Resend)
# FROM_EMAIL=soporte@yourdomain.com
```

### 4. Domain Configuration

#### For Testing (Recommended)
Use the default Resend domain:
```env
FROM_EMAIL=onboarding@resend.dev
```

#### For Production
1. Go to [https://resend.com/domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update your `.env`:
```env
FROM_EMAIL=soporte@yourdomain.com
```

## 📧 Email Templates

### Email Service
Located in `src/utils/emailService.ts`, the generic email sending service includes:

- **Resend integration** for professional email delivery
- **Error handling** with comprehensive logging
- **TypeScript interfaces** for type safety
- **Environment configuration** support

### Password Reset Email
Located in `src/utils/passwordResetEmail.ts`, the password reset template includes:

- **Professional HTML design** with CSS styling
- **Branded header** with PawPals branding and logo
- **Security code** prominently displayed
- **Expiration warning** (15 minutes)
- **Security instructions**
- **Responsive design**

### Template Features
- ✅ **Mobile-friendly** responsive design
- ✅ **Professional styling** with purple gradient theme
- ✅ **Clear call-to-action** with the reset code
- ✅ **Security warnings** and instructions
- ✅ **Brand consistency** with PawPals
- ✅ **Logo integration** with configurable URL

### Image Configuration
The email template includes a logo that can be configured:

1. **Place your logo** in `public/images/logo-pawpals.png`
2. **Configure BASE_URL** in your `.env` file:
   ```env
   BASE_URL=http://localhost:3000
   ```
3. **In production**, update BASE_URL to your domain:
   ```env
   BASE_URL=https://yourdomain.com
   ```

**Logo Requirements:**
- **Size**: 200x200px recommended
- **Format**: PNG with transparency
- **Access**: Available at `/public/images/logo-pawpals.png`

## 🔒 Security Features

### Password Reset Security
- **6-digit codes** for easy entry
- **15-minute expiration** for security
- **One-time use** codes
- **Rate limiting** to prevent abuse
- **No user enumeration** (same response for existing/non-existing emails)

### Email Security
- **Domain verification** required
- **SPF/DKIM** authentication
- **Rate limiting** by Resend
- **Bounce handling** automatic
- **Spam protection** built-in

## 📧 Reservation Email System

### Overview
The reservation email system sends automatic notifications to users when reservation status changes occur. It uses a unified template that adapts dynamically based on the event type.

### Email Types

#### 1. Reservation Created
- **Trigger**: User creates a new reservation
- **Recipients**: Owner and caregiver
- **Content**: Confirmation of created reservation / New pending request

#### 2. Reservation Accepted
- **Trigger**: Caregiver accepts the reservation
- **Recipients**: Owner and caregiver
- **Content**: Confirmation of accepted reservation

#### 3. Reservation Rejected
- **Trigger**: Caregiver rejects the reservation
- **Recipients**: Owner and caregiver
- **Content**: Rejection notification with optional reason

#### 4. Reservation Cancelled
- **Trigger**: Owner or caregiver cancels the reservation
- **Recipients**: Owner and caregiver
- **Content**: Cancellation notification with optional reason

#### 5. Care Started (Automatic)
- **Trigger**: `updateReservationStatuses()` function detects status changes
- **Frequency**: Daily at midnight
- **Recipients**: Owner and caregiver
- **Content**: Care start reminder

#### 6. Care Finished (Automatic)
- **Trigger**: `updateReservationStatuses()` function detects status changes
- **Frequency**: Daily at midnight
- **Recipients**: Owner and caregiver
- **Content**: Completion notification and review request

## 🏗️ Architecture

### Main Files

#### `src/utils/emailService.ts`
- **Generic email service**: `sendEmail()` function
- **Resend integration**: Professional email delivery
- **Error handling**: Comprehensive error management
- **TypeScript interfaces**: `EmailOptions` interface

#### `src/utils/passwordResetEmail.ts`
- **Password reset template**: `generatePasswordResetEmail()`
- **HTML generation**: Professional password reset emails
- **Security features**: 15-minute expiration warnings

#### `src/utils/reservationEmails.ts`
- **Main function**: `sendReservationEmail()`
- **Helper function**: `sendReservationEmailsToBoth()`
- **HTML template**: `generateReservationEmailHTML()`
- **Content mapping**: `emailContentMap`

#### `src/utils/reservationStatusUpdater.ts`
- **Integration in**: `updateReservationStatuses()` (daily at midnight)
- **Automatic emails**: Start and finish of reservations

#### `src/routes/reservations.ts`
- **Integration**: Email calls in each status change
- **Error handling**: Try/catch to avoid affecting main operations

### Data Structure

```typescript
enum ReservationEmailEvent {
  CREATED = 'created',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  STARTED = 'started',
  FINISHED = 'finished',
}

interface ReservationEmailData {
  reservation: IReservation;
  eventType: ReservationEmailEvent;
  recipientRole: 'owner' | 'caregiver';
  customMessage?: string;
  reason?: string;
}
```

## 🎨 Template Design

### Characteristics
- **Responsive**: Adapts to different devices
- **Consistent**: Same style as forgot password
- **Dynamic**: Content adapted according to event and role
- **Professional**: Consistent colors and typography

### Visual Elements
- **Header**: Logo and event title
- **Greeting**: Personalized with recipient name
- **Details**: Complete reservation information
- **Status**: Badge with color according to event type
- **Reason**: Optional section for rejections/cancellations
- **Footer**: Contact information and copyright

### Colors by Status
- **Success (Green)**: Creation, acceptance, completion
- **Warning (Yellow)**: Cancellations
- **Error (Red)**: Rejections
- **Info (Blue)**: Care start

## 🔧 Configuration

### Environment Variables
```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourapp.com
BASE_URL=https://yourapp.com
```

### Cron Jobs
```typescript
// Status update and automatic emails (daily at midnight)
reservationStatusUpdate: '0 0 * * *'
```

## 📊 Implementation Flow

### 1. Reservation Creation
```typescript
// In createReservation
await reservation.save();
await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.CREATED);
```

### 2. Acceptance
```typescript
// In acceptReservation
reservation.status = RESERVATION_STATUS.CONFIRMED;
await reservation.save();
await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.ACCEPTED);
```

### 3. Rejection
```typescript
// In rejectReservation
reservation.status = RESERVATION_STATUS.REJECTED;
await reservation.save();
await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.REJECTED, reason);
```

### 4. Cancellation
```typescript
// In cancelReservation
reservation.status = newStatus;
await reservation.save();
await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.CANCELLED, reason);
```

## 🛡️ Error Handling

### Strategies
1. **Try/catch in main operations**: Don't affect main flow
2. **Detailed logging**: Record successes and errors
3. **Graceful fallback**: Continue without emails if they fail
4. **Data validation**: Verify emails before sending

### Logs
```typescript
console.log(`✅ Reservation email sent: ${eventType} -> ${recipientRole} (${recipient})`);
console.error(`❌ Error sending reservation email: ${eventType} -> ${recipientRole}`);
```

## 📈 Metrics and Monitoring

### Metrics to Track
- **Successful send rate**: Percentage of emails sent correctly
- **Delivery time**: Latency between event and sending
- **Errors by type**: Classification of failures
- **Resource usage**: CPU/memory of cron jobs

### Important Logs
- Reservation creation with emails
- Status changes with notifications
- Cron job execution
- Send errors

## 🔍 Testing

### Test Cases
1. **Creation**: Verify emails to both users
2. **Acceptance**: Confirm confirmation notifications
3. **Rejection**: Validate emails with reason
4. **Cancellation**: Test both types of cancellation
5. **Automatic**: Simulate start/finish dates

### Environments
- **Development**: Emails to test addresses
- **Staging**: Real emails to test users
- **Production**: Real emails to all users

## 🚀 Future Optimizations

### Possible Improvements
1. **Customizable templates**: Allow content configuration
2. **Push notifications**: Integrate with mobile services
3. **SMS**: Add text notifications
4. **Webhooks**: Integration with external systems
5. **Analytics**: Tracking of opens and clicks

### Scalability
- **Queue system**: For handling high volume
- **Rate limiting**: Avoid spam
- **Dynamic templates**: Configuration from DB
- **Multi-language**: Support for different languages

## 📚 Related Documentation

- **[Authentication](./authentication.md)** - Complete auth flow including password reset
- **[Models](./models.md)** - PasswordReset model documentation
- **[Utils](./types.md)** - Email utility functions
- **[Reservations](./reservations.md)** - Reservation system documentation 