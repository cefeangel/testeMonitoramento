import { Router } from 'express';
import * as publicController from '../controllers/publicController.js';
import * as galleryController from '../controllers/galleryController.js';

import { guestProtect } from '../middlewares/guestProtect.js';
import upload from '../middlewares/upload.js';
import { uploadLimiter } from '../middlewares/rateLimiters.js';

const router = Router();

// Todas as rotas públicas de convidados exigem o middleware guestProtect
// O token deve vir na query (?token=...) ou no header 'x-guest-token'

router.get('/events/:eventId', guestProtect, publicController.getEventAndSchedule);
router.get('/events/:eventId/gallery', guestProtect, publicController.getGallery);

// Upload do convidado
router.post(
  '/events/:eventId/gallery/upload', 
  guestProtect, 
  uploadLimiter,
  upload.single('foto'), 
  publicController.uploadGuestPhoto
);

// Rota legada para compatibilidade
router.post(
  '/events/:eventId/upload', 
  guestProtect, 
  uploadLimiter,
  upload.single('foto'), 
  publicController.uploadGuestPhoto
);

// Curtidas (Interação Social)
router.post('/events/:eventId/photos/:photoId/like', guestProtect, galleryController.toggleLike);

export default router;
