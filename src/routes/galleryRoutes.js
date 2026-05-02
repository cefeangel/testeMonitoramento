import { Router } from 'express';
import { param } from 'express-validator';
import * as galleryController from '../controllers/galleryController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

router.get('/events/:eventId/gallery', [
  param('eventId').isInt({ min: 1 }),
  validate
], galleryController.getGallery);

// Nova rota: Upload direto para o evento (sem vincular a item do cronograma)
router.post('/events/:eventId/gallery/photos', [
  uploadLimiter,
  upload.any(),
  param('eventId').isInt({ min: 1 }),
  validate
], galleryController.uploadPhoto);

router.delete('/events/:eventId/photos/:photoId', [
  param('eventId').isInt({ min: 1 }),
  param('photoId').isInt({ min: 1 }),
  validate
], galleryController.deletePhoto);

router.get('/events/:eventId/gallery/top', [
  param('eventId').isInt({ min: 1 }),
  validate
], galleryController.getTopPhotos);

// Rotas específicas de cronograma (mantidas para compatibilidade)
router.get('/events/:eventId/schedule/:scheduleId/photos', [
  param('eventId').isInt({ min: 1 }),
  param('scheduleId').isInt({ min: 1 }),
  validate
], galleryController.getGalleryByScheduleItem);

router.post('/events/:eventId/schedule/:scheduleId/photos', [
  uploadLimiter,
  upload.any(),
  param('eventId').isInt({ min: 1 }),
  param('scheduleId').isInt({ min: 1 }),
  validate
], galleryController.uploadPhoto);

// Rota de Proxy para Download (contorna restrições de CORS do Storage)
router.get('/gallery/download-proxy', galleryController.downloadProxy);

export default router;
