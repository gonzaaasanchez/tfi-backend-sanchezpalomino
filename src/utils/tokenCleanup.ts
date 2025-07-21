import { cleanupExpiredTokens } from './tokenBlacklist';

/**
 * Clean up expired tokens from blacklist
 * This function should be called periodically (e.g., daily)
 */
export const runTokenCleanup = async (): Promise<void> => {
  try {
    console.log('🧹 Iniciando limpieza de tokens expirados...');
    
    const deletedCount = await cleanupExpiredTokens();
    
    if (deletedCount > 0) {
      console.log(`✅ Limpieza completada: ${deletedCount} tokens expirados eliminados`);
    } else {
      console.log('✅ No se encontraron tokens expirados para limpiar');
    }
  } catch (error) {
    console.error('❌ Error durante la limpieza de tokens:', error);
  }
};

/**
 * Schedule token cleanup to run daily at 2 AM
 */
export const scheduleTokenCleanup = (): void => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0); // 2 AM

  const timeUntilCleanup = tomorrow.getTime() - now.getTime();

  // Schedule first cleanup
  setTimeout(() => {
    runTokenCleanup();
    
    // Then schedule daily cleanup
    setInterval(runTokenCleanup, 24 * 60 * 60 * 1000); // 24 hours
  }, timeUntilCleanup);

  console.log(`🕐 Limpieza de tokens programada para: ${tomorrow.toLocaleString()}`);
}; 