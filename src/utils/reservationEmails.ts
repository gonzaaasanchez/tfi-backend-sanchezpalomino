import { IReservation } from '../models/Reservation';
import { sendEmail } from './emailService';
import { formatCurrency } from './common';
import { CARE_LOCATION } from '../types';

// Enum for email events
export enum ReservationEmailEvent {
  CREATED = 'created',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  STARTED = 'started',
  FINISHED = 'finished',
}

// Interface for email data
export interface ReservationEmailData {
  reservation: IReservation;
  eventType: ReservationEmailEvent;
  recipientRole: 'owner' | 'caregiver';
  customMessage?: string;
  reason?: string;
}

// Email content mapping
const emailContentMap = {
  [ReservationEmailEvent.CREATED]: {
    owner: {
      subject: '✅ Reserva Creada Exitosamente',
      title: 'Reserva Creada',
      message:
        'Tu reserva ha sido creada y enviada al cuidador. Te notificaremos cuando sea aceptada.',
      status: 'success' as const,
    },
    caregiver: {
      subject: '🐾 Nueva Solicitud de Reserva',
      title: 'Nueva Reserva Pendiente',
      message:
        'Has recibido una nueva solicitud de reserva. Revisa los detalles y acepta o rechaza según tu disponibilidad.',
      status: 'info' as const,
    },
  },
  [ReservationEmailEvent.ACCEPTED]: {
    owner: {
      subject: '✅ Reserva Aceptada',
      title: '¡Reserva Confirmada!',
      message:
        '¡Excelente! Tu reserva ha sido aceptada por el cuidador. Ya puedes prepararte para el cuidado de tu mascota.',
      status: 'success' as const,
    },
    caregiver: {
      subject: '✅ Reserva Aceptada',
      title: 'Reserva Aceptada',
      message:
        'Has aceptado la reserva. Prepárate para el cuidado de la mascota en las fechas acordadas.',
      status: 'success' as const,
    },
  },
  [ReservationEmailEvent.REJECTED]: {
    owner: {
      subject: '❌ Reserva Rechazada',
      title: 'Reserva Rechazada',
      message:
        'El cuidador ha rechazado tu reserva. Puedes buscar otro cuidador disponible.',
      status: 'error' as const,
    },
    caregiver: {
      subject: '❌ Reserva Rechazada',
      title: 'Reserva Rechazada',
      message: 'Has rechazado la reserva. El propietario ha sido notificado.',
      status: 'error' as const,
    },
  },
  [ReservationEmailEvent.CANCELLED]: {
    owner: {
      subject: '🚫 Reserva Cancelada',
      title: 'Reserva Cancelada',
      message:
        'La reserva ha sido cancelada. Si tienes alguna pregunta, contacta al cuidador.',
      status: 'warning' as const,
    },
    caregiver: {
      subject: '🚫 Reserva Cancelada',
      title: 'Reserva Cancelada',
      message:
        'La reserva ha sido cancelada. Si tienes alguna pregunta, contacta al propietario.',
      status: 'warning' as const,
    },
  },
  [ReservationEmailEvent.STARTED]: {
    owner: {
      subject: '🐕 ¡El Cuidado Comenzó!',
      title: 'Cuidado Iniciado',
      message:
        'El cuidado de tu mascota ha comenzado. El cuidador está ahora responsable de tu mascota.',
      status: 'info' as const,
    },
    caregiver: {
      subject: '🐕 ¡El Cuidado Comenzó!',
      title: 'Cuidado Iniciado',
      message:
        'El cuidado de la mascota ha comenzado. Recuerda ser responsable y mantener comunicación con el propietario.',
      status: 'info' as const,
    },
  },
  [ReservationEmailEvent.FINISHED]: {
    owner: {
      subject: '🏁 Cuidado Completado',
      title: 'Cuidado Finalizado',
      message:
        'El cuidado de tu mascota ha finalizado. No olvides dejar una reseña al cuidador.',
      status: 'success' as const,
    },
    caregiver: {
      subject: '🏁 Cuidado Completado',
      title: 'Cuidado Finalizado',
      message:
        'El cuidado de la mascota ha finalizado. Gracias por tu servicio profesional.',
      status: 'success' as const,
    },
  },
};

// Generate email HTML template
const generateReservationEmailHTML = (data: ReservationEmailData): string => {
  const { reservation, eventType, recipientRole, reason } = data;
  const content = emailContentMap[eventType][recipientRole];

  // Get user data
  const owner = reservation.user as any;
  const caregiver = reservation.caregiver as any;
  const pets = reservation.pets as any[];

  // Format dates
  const startDate = new Date(reservation.startDate).toLocaleDateString('es-AR');
  const endDate = new Date(reservation.endDate).toLocaleDateString('es-AR');

  // Get care location text
  const careLocationText =
    reservation.careLocation === CARE_LOCATION.PET_HOME
      ? 'En hogar de la mascota'
      : 'En hogar del cuidador';

  // Get pets names
  const petsNames = pets.map((pet) => pet.name).join(', ');

  // Status color mapping
  const statusColors = {
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  };

  const statusColor = statusColors[content.status];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${content.subject}</title>
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
    .reservation-details {
      background: linear-gradient(135deg, #f1f2fc 0%, #e6e6f9 100%);
      border: 2px solid #8f80d4;
      border-radius: 12px;
      padding: 25px;
      margin: 30px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .detail-row:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #555555;
    }
    .detail-value {
      color: #333333;
      text-align: right;
    }
    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      color: white;
      font-weight: 600;
      font-size: 14px;
      background-color: ${statusColor};
    }
    .reason-section {
      background-color: #fcf6f0;
      border-left: 4px solid #d97036;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .reason-title {
      color: #a84526;
      font-weight: 600;
      margin-bottom: 15px;
      font-size: 16px;
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
      <h1>${content.title}</h1>
    </div>
    <div class="content">
      <div class="greeting">
        Hola <strong>${recipientRole === 'owner' ? owner.firstName : caregiver.firstName}</strong>,
      </div>
      <div class="description">
        ${content.message}
      </div>
      
      <div class="reservation-details">
        <div class="detail-row">
          <span class="detail-label">Estado:</span>
          <span class="status-badge">${content.title}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mascotas:</span>
          <span class="detail-value">${petsNames}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ubicación:</span>
          <span class="detail-value">${careLocationText}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de inicio:</span>
          <span class="detail-value">${startDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Fecha de fin:</span>
          <span class="detail-value">${endDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Precio total:</span>
          <span class="detail-value">${formatCurrency(reservation.totalPrice)}</span>
        </div>
        ${
          reservation.visitsCount
            ? `
        <div class="detail-row">
          <span class="detail-label">Visitas por día:</span>
          <span class="detail-value">${reservation.visitsCount}</span>
        </div>
        `
            : ''
        }
      </div>
      
      ${
        reason
          ? `
      <div class="reason-section">
        <div class="reason-title">📝 Razón:</div>
        <div>${reason}</div>
      </div>
      `
          : ''
      }
      
      <div class="contact-info">
        Si tienes alguna pregunta, no dudes en contactar al ${recipientRole === 'owner' ? 'cuidador' : 'propietario'} a través de nuestra aplicación.
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

// Main function to send reservation emails
export const sendReservationEmail = async (
  data: ReservationEmailData
): Promise<boolean> => {
  try {
    const { reservation, eventType, recipientRole } = data;

    // Get recipient email with better error handling
    let recipient: string | undefined;
    
    if (recipientRole === 'owner') {
      recipient = (reservation.user as any)?.email;
      if (!recipient) {
        console.error('❌ No se encontró email del propietario:', {
          userId: (reservation.user as any)?._id,
          userData: reservation.user
        });
        return false;
      }
    } else {
      recipient = (reservation.caregiver as any)?.email;
      if (!recipient) {
        console.error('❌ No se encontró email del cuidador:', {
          caregiverId: (reservation.caregiver as any)?._id,
          caregiverData: reservation.caregiver
        });
        return false;
      }
    }

    // Generate email content
    const content = emailContentMap[eventType][recipientRole];
    const html = generateReservationEmailHTML(data);

    // Send email
    const success = await sendEmail({
      to: recipient,
      subject: content.subject,
      html,
    });

    if (success) {
      console.log(
        `✅ Email de reserva enviado: ${eventType} -> ${recipientRole} (${recipient})`
      );
    } else {
      console.error(
        `❌ Error enviando email de reserva: ${eventType} -> ${recipientRole}`
      );
    }

    return success;
  } catch (error) {
    console.error('❌ Error en sendReservationEmail:', error);
    return false;
  }
};

// Helper function to send emails to both users
export const sendReservationEmailsToBoth = async (
  reservation: IReservation,
  eventType: ReservationEmailEvent,
  reason?: string
): Promise<void> => {
  try {
    // Send to owner
    await sendReservationEmail({
      reservation,
      eventType,
      recipientRole: 'owner',
      reason,
    });

    // Send to caregiver
    await sendReservationEmail({
      reservation,
      eventType,
      recipientRole: 'caregiver',
      reason,
    });
  } catch (error) {
    console.error('❌ Error enviando emails a ambos usuarios:', error);
  }
};
