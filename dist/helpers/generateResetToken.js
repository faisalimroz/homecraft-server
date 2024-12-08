"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
// Generate a token and expiration for the reset link
const generateResetToken = () => {
    const token = crypto_1.default.randomBytes(32).toString('hex'); // 64-character token
    const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // Token valid for 1 hour
    return { hashedToken, expires };
};
exports.generateResetToken = generateResetToken;
