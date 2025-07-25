import cron from 'node-cron';
import BlacklistedToken from '../models/BlacklistedToken';
import SessionAudit from '../models/SessionAudit';
import PasswordReset from '../models/PasswordReset';
import { logChanges } from './auditLogger';
import { updateReservationStatuses } from './reservationStatusUpdater';

/**
 * Cron Jobs for TFI Backend
 * Handles automated tasks like cleanup, maintenance, etc.
 */

// Health check cron (every 5 minutes)
export const healthCheck = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('💚 System health check - All systems operational');
    // Aquí podrías agregar más verificaciones como:
    // - Conexión a base de datos
    // - Espacio en disco
    // - Memoria disponible
  } catch (error) {
    console.error('❌ Health check failed:', error);
  }
});

// Clean up expired blacklisted tokens (daily at 2 AM)
export const cleanupBlacklistedTokens = cron.schedule('0 2 * * *', async () => {
  try {
    const result = await BlacklistedToken.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(
        `🧹 Cleaned up ${result.deletedCount} expired blacklisted tokens`
      );
      await logChanges('SYSTEM', 'CRON', 'SYSTEM', 'Cron Job', [
        {
          field: 'deletedCount',
          oldValue: 0,
          newValue: result.deletedCount,
        },
      ]);
    }
  } catch (error) {
    console.error('❌ Error cleaning up blacklisted tokens:', error);
  }
});

// Clean up old session audits (every 3 months on the 1st at 3 AM)
export const cleanupSessionAudits = cron.schedule('0 3 1 */3 *', async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await SessionAudit.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} old session audits`);
      await logChanges('SYSTEM', 'CRON', 'SYSTEM', 'Cron Job', [
        {
          field: 'deletedCount',
          oldValue: 0,
          newValue: result.deletedCount,
        },
      ]);
    }
  } catch (error) {
    console.error('❌ Error cleaning up session audits:', error);
  }
});

// Clean up expired password reset tokens (every 6 hours)
export const cleanupPasswordResets = cron.schedule('0 */6 * * *', async () => {
  try {
    const result = await PasswordReset.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    if (result.deletedCount > 0) {
      console.log(
        `🧹 Cleaned up ${result.deletedCount} expired password reset tokens`
      );
      await logChanges('SYSTEM', 'CRON', 'SYSTEM', 'Cron Job', [
        {
          field: 'deletedCount',
          oldValue: 0,
          newValue: result.deletedCount,
        },
      ]);
    }
  } catch (error) {
    console.error('❌ Error cleaning up password reset tokens:', error);
  }
});

// Daily reservation status update (midnight)
export const reservationStatusUpdate = cron.schedule('0 0 * * *', async () => {
  try {
    await updateReservationStatuses();
  } catch (error) {
    console.error('❌ Error updating reservation statuses:', error);
  }
});

// Initialize all cron jobs
export const initializeCronJobs = () => {
  console.log('🚀 Initializing cron jobs...');

  cleanupBlacklistedTokens.start();
  cleanupSessionAudits.start();
  cleanupPasswordResets.start();
  healthCheck.start();
  reservationStatusUpdate.start();

  console.log('✅ All cron jobs started successfully');
};

// Stop all cron jobs (useful for graceful shutdown)
export const stopCronJobs = () => {
  console.log('🛑 Stopping cron jobs...');

  healthCheck.stop();
  cleanupBlacklistedTokens.stop();
  cleanupSessionAudits.stop();
  cleanupPasswordResets.stop();
  reservationStatusUpdate.stop();

  console.log('✅ All cron jobs stopped');
};
