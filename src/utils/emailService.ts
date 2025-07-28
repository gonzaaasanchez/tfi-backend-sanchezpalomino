import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@tuapp.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}; 