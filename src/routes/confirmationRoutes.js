import { Router } from 'express';
import { body, param } from 'express-validator';
import * as confirmationController from '../controllers/confirmationController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

const paramValidation = [
  param('eventId').isInt({ min: 1 }),
  param('guestId').isInt({ min: 1 }),
  validate
];

const statusValidation = [
  ...paramValidation,
  body('status').isIn(['PENDENTE', 'CONFIRMADO', 'CANCELADO']).withMessage('Status inválido'),
  validate
];

router.post('/', statusValidation, confirmationController.confirmPresence);
router.delete('/', paramValidation, confirmationController.cancelConfirmation);
// Esta rota é meio solta aqui, idealmente ficaria em /events/:eventId/confirmations
// Mas para centralizar os imports do router no Express, declaramos nela recebendo os params via mergeParams
router.get('/all', [param('eventId').isInt({ min: 1 }), validate], confirmationController.getAllConfirmations);

export default router;
