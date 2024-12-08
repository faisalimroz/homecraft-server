import crypto from 'crypto';

// Generate a token and expiration for the reset link
export const generateResetToken = () => {
    const token = crypto.randomBytes(32).toString('hex'); // 64-character token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour
    return { hashedToken, expires };
};
