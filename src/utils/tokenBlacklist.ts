import BlacklistedToken from '../models/BlacklistedToken';
import { verifyToken, JWTPayload } from './auth';

export interface TokenInfo {
  token: string;
  userId: string;
  userType: 'user' | 'admin';
  expiresAt: Date;
}

/**
 * Add a token to the blacklist
 */
export const blacklistToken = async (token: string): Promise<boolean> => {
  try {
    // Verify the token to get user info
    const decoded = verifyToken(token) as JWTPayload;
    
    // Create blacklisted token record
    const blacklistedToken = new BlacklistedToken({
      token,
      userId: decoded.userId,
      userType: decoded.type || 'user',
      expiresAt: new Date(decoded.exp || Date.now() + 24 * 60 * 60 * 1000), // Default 24h if no exp
    });

    await blacklistedToken.save();
    return true;
  } catch (error) {
    console.error('Error blacklisting token:', error);
    return false;
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    return !!blacklistedToken;
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    return false;
  }
};

/**
 * Remove a token from blacklist (useful for testing or manual cleanup)
 */
export const removeFromBlacklist = async (token: string): Promise<boolean> => {
  try {
    const result = await BlacklistedToken.deleteOne({ token });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error removing token from blacklist:', error);
    return false;
  }
};

/**
 * Get all blacklisted tokens for a user (useful for admin purposes)
 */
export const getUserBlacklistedTokens = async (
  userId: string,
  userType: 'user' | 'admin'
): Promise<TokenInfo[]> => {
  try {
    const tokens = await BlacklistedToken.find({ userId, userType })
      .select('token userId userType expiresAt createdAt')
      .sort({ createdAt: -1 });

    return tokens.map(token => ({
      token: token.token,
      userId: token.userId,
      userType: token.userType,
      expiresAt: token.expiresAt,
    }));
  } catch (error) {
    console.error('Error getting user blacklisted tokens:', error);
    return [];
  }
};

/**
 * Clean up expired tokens from blacklist
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  try {
    const result = await BlacklistedToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
}; 