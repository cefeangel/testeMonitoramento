import QRCode from '../models/QRCode.js';
import { AppError } from '../utils/AppError.js';

export const guestProtect = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const token = req.query.token || req.headers['x-guest-token'];

    if (!token) {
      throw new AppError('Acesso negado. Token de convidado não fornecido.', 401);
    }

    const qr = await QRCode.findOne({
      where: { 
        event_id: eventId,
        token: token
      }
    });

    if (!qr) {
      throw new AppError('Acesso inválido. Token não reconhecido para este evento.', 403);
    }

    // Verificar expiração
    if (new Date(qr.expires_at) <= new Date()) {
      throw new AppError('Este acesso via QR Code expirou.', 403);
    }

    // Adicionar informações ao request e desativar cache para garantir validação real
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    req.guestAccess = {
      eventId: qr.event_id,
      token: qr.token
    };

    next();
  } catch (error) {
    next(error);
  }
};
