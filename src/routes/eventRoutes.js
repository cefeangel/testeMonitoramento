import { Router } from 'express';
import { body } from 'express-validator';
import * as eventController from '../controllers/eventController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

const router = Router();

router.use(authProtect); // Todas as rotas de eventos exigem auth

const eventValidation = [
  body('nome').notEmpty().trim().isLength({ max: 200 }).withMessage('Nome deve ter até 200 caracteres'),
  body('descricao').optional().isString(),
  body('data_hora').isISO8601().withMessage('Data e hora no formato ISO8601'),
  body('capacidade_total').isInt({ min: 1 }).withMessage('Capacidade deve ser maior que 0'),
  body('max_dependentes_por_convidado').optional().isInt({ min: 0 }).withMessage('Máximo de dependentes não pode ser negativo'),
  validate
];

router.post('/', eventValidation, eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/report', eventController.getReport);
router.get('/:id', eventController.getEvent);
router.put('/:id', eventValidation, eventController.updateEvent);
router.post('/:id/cover', upload.single('foto'), eventController.uploadCover);
router.delete('/:id', eventController.deleteEvent);

export default router;
