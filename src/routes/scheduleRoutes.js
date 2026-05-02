import { Router } from 'express';
import { body, param } from 'express-validator';
import upload from '../middlewares/upload.js';
import * as scheduleController from '../controllers/scheduleController.js';
import { validate } from '../middlewares/validation.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router({ mergeParams: true });

router.use(authProtect);

const scheduleValidation = [
  param('eventId').isInt({ min: 1 }).withMessage('ID do evento inválido'),
  body('titulo').notEmpty().trim().withMessage('O título é obrigatório'),
  body('descricao').optional().isString(),
  body('data_hora').isISO8601().withMessage('Data e hora inválida'),
  validate
];

const paramValidation = [
  param('eventId').isInt({ min: 1 }),
  validate
];

router.post('/', upload.single('foto'), scheduleValidation, scheduleController.createScheduleItem);
router.get('/', paramValidation, scheduleController.getScheduleItems);
router.get('/:id', paramValidation, scheduleController.getScheduleItem);
router.put('/:id', upload.single('foto'), scheduleValidation, scheduleController.updateScheduleItem);
router.delete('/:id', paramValidation, scheduleController.deleteScheduleItem);

router.post('/:id/photo', paramValidation, upload.single('foto'), scheduleController.uploadPhoto);

export default router;
