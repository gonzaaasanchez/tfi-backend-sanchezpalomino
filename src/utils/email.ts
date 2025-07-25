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

export const generatePasswordResetEmail = (
  code: string,
  userName: string
): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Recuperar Contraseña en PawPals</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #424242; 
      margin: 0;
      padding: 0;
      background-color: #F4F3F3;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background-color: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header { 
      background: linear-gradient(135deg, #8f80d4 0%, #7f66c5 100%);
      color: white; 
      padding: 30px 20px; 
      text-align: center;
      position: relative;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 15px;
      display: block;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      /* Aquí puedes poner la imagen: background-image: url('URL_DE_TU_LOGO'); */
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .content { 
      padding: 40px 30px; 
      background-color: #FFFFFF;
    }
    .greeting {
      font-size: 18px;
      color: #424242;
      margin-bottom: 20px;
    }
    .description {
      color: #555555;
      margin-bottom: 30px;
    }
    .code-container {
      background: linear-gradient(135deg, #f1f2fc 0%, #e6e6f9 100%);
      border: 2px solid #8f80d4;
      border-radius: 12px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .code { 
      font-size: 32px; 
      font-weight: 700; 
      color: #7f66c5;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    .warning-section {
      background-color: #fcf6f0;
      border-left: 4px solid #d97036;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .warning-title {
      color: #a84526;
      font-weight: 600;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .warning-list {
      color: #6d3021;
      margin: 0;
      padding-left: 20px;
    }
    .warning-list li {
      margin-bottom: 8px;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      color: #939393; 
      font-size: 14px;
      background-color: #F4F3F3;
      border-top: 1px solid #DDDDDD;
    }
    .contact-info {
      margin-top: 20px;
      color: #777777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.BASE_URL || 'https://tfi-backend-sanchezpalomino.onrender.com'}/public/images/icon-pawpals.png" alt="PawPals Logo" class="logo">
      <h1>🔐 Recuperar Contraseña</h1>
    </div>
    <div class="content">
      <div class="greeting">
        Hola <strong>${userName}</strong>,
      </div>
      <div class="description">
        Has solicitado restablecer tu contraseña en PawPals. Usa el siguiente código para completar el proceso:
      </div>
      
      <div class="code-container">
        <div class="code">${code}</div>
      </div>
      
      <div class="warning-section">
        <div class="warning-title">⚠️ Información Importante:</div>
        <ul class="warning-list">
          <li>Este código expira en 15 minutos</li>
          <li>No compartas este código con nadie</li>
          <li>Si no solicitaste este cambio, ignora este email</li>
        </ul>
      </div>
      
      <div class="contact-info">
        Si tienes alguna pregunta, no dudes en contactarnos a través de nuestra aplicación.
      </div>
    </div>
    <div class="footer">
      <p>Este es un email automático de PawPals, por favor no respondas a este mensaje.</p>
      <p>© 2025 PawPals. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
};
