import crypto from 'crypto';

// Generate a random 6-digit code
export const generateResetCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Validate password strength (consistent with User model)
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
