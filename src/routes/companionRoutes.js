import { Router } from 'express';
import { body, param } from 'express-validator';
import * as companionController from '../controllers/companionController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

const companionValidation = [
  param('eventId').isInt({ min: 1 }),
  param('guestId').isInt({ min: 1 }),
  body('nome_completo').notEmpty().trim().withMessage('Nome completo é obrigatório'),
  validate
];

const paramValidation = [
  param('eventId').isInt({ min: 1 }),
  param('guestId').isInt({ min: 1 }),
  validate
];

router.post('/', companionValidation, companionController.createCompanion);
router.get('/', paramValidation, companionController.getCompanions);
router.delete('/:id', [
  ...paramValidation,
  param('id').isInt({ min: 1 })
], companionController.deleteCompanion);

export default router;
