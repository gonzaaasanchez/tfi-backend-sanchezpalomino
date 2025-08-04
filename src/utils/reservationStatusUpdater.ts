import Reservation from '../models/Reservation';
import { RESERVATION_STATUS } from '../types';
import { logChanges } from './auditLogger';
import { sendReservationEmailsToBoth, ReservationEmailEvent } from './reservationEmails';

/**
 * Updates reservation statuses based on business rules
 * Runs daily at midnight to handle status transitions
 */
export const updateReservationStatuses = async (): Promise<void> => {
  try {
    console.log('🔄 Iniciando actualización automática de estados de reservas...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow
    
    let totalUpdated = 0;
    
    // 1. PENDING → REJECTED: Reservas que deberían empezar hoy pero no fueron confirmadas
    const pendingToReject = await Reservation.find({
      status: RESERVATION_STATUS.WAITING_ACCEPTANCE,
      startDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    if (pendingToReject.length > 0) {
      const result = await Reservation.updateMany(
        { _id: { $in: pendingToReject.map(r => r._id) } },
        { status: RESERVATION_STATUS.REJECTED }
      );
      
      console.log(`❌ ${result.modifiedCount} reservas PENDING → REJECTED (no confirmadas a tiempo)`);
      totalUpdated += result.modifiedCount;
      
      // Log changes for audit
      for (const reservation of pendingToReject) {
        await logChanges('Reservation', (reservation._id as any).toString(), 'SYSTEM', 'Cron Job', [{
          field: 'status',
          oldValue: RESERVATION_STATUS.WAITING_ACCEPTANCE,
          newValue: RESERVATION_STATUS.REJECTED
        }]);
      }
    }
    
    // 2. CONFIRMED → STARTED: Reservas confirmadas que empiezan hoy
    const confirmedToStart = await Reservation.find({
      status: RESERVATION_STATUS.CONFIRMED,
      startDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('user', 'firstName lastName email')
      .populate('caregiver', 'firstName lastName email')
      .populate('pets', 'name');
    
    if (confirmedToStart.length > 0) {
      const result = await Reservation.updateMany(
        { _id: { $in: confirmedToStart.map(r => r._id) } },
        { status: RESERVATION_STATUS.STARTED }
      );
      
      console.log(`🚀 ${result.modifiedCount} reservas CONFIRMED → STARTED (iniciando hoy)`);
      totalUpdated += result.modifiedCount;
      
      // Send emails and log changes for audit
      for (const reservation of confirmedToStart) {
        try {
          await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.STARTED);
          console.log(`✅ Email de inicio enviado para reserva ${reservation._id}`);
        } catch (error) {
          console.error(`❌ Error enviando email de inicio para reserva ${reservation._id}:`, error);
        }
        
        await logChanges('Reservation', (reservation._id as any).toString(), 'SYSTEM', 'Cron Job', [{
          field: 'status',
          oldValue: RESERVATION_STATUS.CONFIRMED,
          newValue: RESERVATION_STATUS.STARTED
        }]);
      }
    }
    
    // 3. STARTED → FINISHED: Reservas que terminan hoy
    const startedToFinish = await Reservation.find({
      status: RESERVATION_STATUS.STARTED,
      endDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('user', 'firstName lastName email')
      .populate('caregiver', 'firstName lastName email')
      .populate('pets', 'name');
    
    if (startedToFinish.length > 0) {
      const result = await Reservation.updateMany(
        { _id: { $in: startedToFinish.map(r => r._id) } },
        { status: RESERVATION_STATUS.FINISHED }
      );
      
      console.log(`✅ ${result.modifiedCount} reservas STARTED → FINISHED (finalizando hoy)`);
      totalUpdated += result.modifiedCount;
      
      // Send emails and log changes for audit
      for (const reservation of startedToFinish) {
        try {
          await sendReservationEmailsToBoth(reservation, ReservationEmailEvent.FINISHED);
          console.log(`✅ Email de finalización enviado para reserva ${reservation._id}`);
        } catch (error) {
          console.error(`❌ Error enviando email de finalización para reserva ${reservation._id}:`, error);
        }
        
        await logChanges('Reservation', (reservation._id as any).toString(), 'SYSTEM', 'Cron Job', [{
          field: 'status',
          oldValue: RESERVATION_STATUS.STARTED,
          newValue: RESERVATION_STATUS.FINISHED
        }]);
      }
    }
    
    if (totalUpdated > 0) {
      console.log(`🎉 Actualización completada: ${totalUpdated} reservas actualizadas`);
      
      // Log summary for audit
      await logChanges('SYSTEM', 'CRON', 'SYSTEM', 'Cron Job', [{
        field: 'reservationUpdates',
        oldValue: 0,
        newValue: totalUpdated
      }]);
    } else {
      console.log('✅ No se encontraron reservas que requieran actualización de estado');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando estados de reservas:', error);
    throw error;
  }
}; 