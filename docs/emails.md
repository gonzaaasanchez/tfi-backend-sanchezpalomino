# 📧 Email System

The application includes a complete email system powered by **Resend** for professional email delivery.

## 🚀 Features

- **Password Recovery**: Automated email with reset codes
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

### Password Reset Email
Located in `src/utils/email.ts`, the password reset template includes:

- **Professional HTML design** with CSS styling
- **Branded header** with PawPals branding
- **Security code** prominently displayed
- **Expiration warning** (15 minutes)
- **Security instructions**
- **Responsive design**

### Template Features
- ✅ **Mobile-friendly** responsive design
- ✅ **Professional styling** with green theme
- ✅ **Clear call-to-action** with the reset code
- ✅ **Security warnings** and instructions
- ✅ **Brand consistency** with PawPals

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

## 📚 Related Documentation

- **[Authentication](./authentication.md)** - Complete auth flow including password reset
- **[Models](./models.md)** - PasswordReset model documentation
- **[Utils](./types.md)** - Email utility functions 