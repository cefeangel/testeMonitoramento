import { Router } from 'express';
import { body, param } from 'express-validator';
import * as guestController from '../controllers/guestController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

// /^\+55 \(\d{2}\) \d{4,5}-\d{4}$/
const guestValidation = [
  param('eventId').isInt({ min: 1 }),
  body('nome_completo').notEmpty().trim().withMessage('Nome é obrigatório'),
  body('telefone')
    .matches(/^\+55 \(\d{2}\) \d{4,5}-\d{4}$/)
    .withMessage('Formato: +55 (99) 99999-9999'),
  validate
];

const paramValidation = [
  param('eventId').isInt({ min: 1 }),
  validate
];

router.post('/', guestValidation, guestController.createGuest);
router.get('/', paramValidation, guestController.getGuests);
router.get('/:id', paramValidation, guestController.getGuest);
router.put('/:id', guestValidation, guestController.updateGuest);
router.delete('/:id', paramValidation, guestController.deleteGuest);

export default router;
