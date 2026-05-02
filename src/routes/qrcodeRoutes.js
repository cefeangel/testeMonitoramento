import { Router } from 'express';
import { body, param } from 'express-validator';
import * as qrcodeController from '../controllers/qrcodeController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

const paramValidation = [
  param('eventId').isInt({ min: 1 }),
  validate
];

const createValidation = [
  ...paramValidation,
  body('expires_at')
    .isISO8601()
    .withMessage('Data de expiração inválida'),
  body('foto_capa')
    .optional()
    .isString()
    .withMessage('URL da capa deve ser uma string'),
  validate
];

router.post('/', createValidation, qrcodeController.generateQRCode);
router.get('/', paramValidation, qrcodeController.getQRCode);
router.get('/download', paramValidation, qrcodeController.downloadQRCode);

export default router;
