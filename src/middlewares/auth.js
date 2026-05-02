import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const authProtect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      // Se não houver token, redireciona para login se for uma página HTML (opcional)
      // Por enquanto tratamos apenas como erro de API 401
      throw new AppError('Sessão expirada. Por favor, faça login novamente.', 401);
    }

    const decoded = verifyToken(token);
    req.adminId = decoded.adminId; // Injeta o ID do admin na req

    next();
  } catch (error) {
    next(error);
  }
};
