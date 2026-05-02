import { rateLimit } from 'express-rate-limit';

// Limite Global: 1000/min - Para navegação fluida
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas requisições, tente novamente em um minuto.' }
});

// Limite de Autenticação: 20/min - Proteção contra Brute-force
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Muitas tentativas de acesso. Tente novamente em um minuto.' }
});

// Limite de Upload: 50/min - Proteção de recursos do servidor (CPU/Disco)
export const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Limite de uploads atingido. Aguarde um minuto antes de enviar mais fotos.' }
});
