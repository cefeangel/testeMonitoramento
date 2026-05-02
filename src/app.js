import express from 'express';
import cors from 'cors';
import path from 'path';
import { readFileSync } from 'fs';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const swaggerDocument = JSON.parse(readFileSync(new URL('./swagger.json', import.meta.url)));

import { errorHandler } from './middlewares/errorHandler.js';
import { apiLimiter, authLimiter } from './middlewares/rateLimiters.js';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import guestRoutes from './routes/guestRoutes.js';
import companionRoutes from './routes/companionRoutes.js';
import confirmationRoutes from './routes/confirmationRoutes.js';
import qrcodeRoutes from './routes/qrcodeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import guestGlobalRoutes from './routes/guestGlobalRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();

// Confiar em proxies (ex: Nginx redirecionando para o app)
// Importante para req.protocol e req.get('host') virem corretos
app.set('trust proxy', 1);

// Security and Performance
app.use(helmet({
  contentSecurityPolicy: false, // Desativado para facilitar carregamento de fontes externas e scripts se necessário
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Aplicação de Rate Limitings Inteligentes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Arquivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Redirecionamento raiz para login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas Base
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Rotas Aninhadas via mergeParams nos models
app.use('/api/events/:eventId/schedule', scheduleRoutes);
app.use('/api/events/:eventId/guests', guestRoutes);
app.use('/api/events/:eventId/guests/:guestId/companions', companionRoutes);

// Rota de confirmações (tem get all por evento, e manage por guest)
app.use('/api/events/:eventId/confirmations', confirmationRoutes);
app.use('/api/events/:eventId/guests/:guestId/confirm', confirmationRoutes);

app.use('/api/events/:eventId/qrcode', qrcodeRoutes);

// As rotas de galeria cuidam de seus proprios endpoints
app.use('/api/guests', guestGlobalRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', galleryRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// Middleware Centralizado de Tratamento de Erro (Deve ser o Último)
app.use(errorHandler);

export default app;
