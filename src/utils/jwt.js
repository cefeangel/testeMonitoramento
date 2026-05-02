import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from './AppError.js';

dotenv.config();

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Token inválido ou expirado', 401);
  }
};
