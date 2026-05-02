import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validation.js';

const router = Router();

router.post('/register', [
  body('nome').notEmpty().withMessage('Nome é obrigatório').trim(),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter no mínimo 6 caracteres'),
  validate
], authController.register);

import { authProtect } from '../middlewares/auth.js';

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
  validate
], authController.login);

router.get('/profile', authProtect, authController.getProfile);

router.put('/profile', authProtect, [
  body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio').trim(),
  body('email').optional().isEmail().withMessage('Email inválido').normalizeEmail(),
  body('senha').optional().isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  validate
], authController.updateProfile);

export default router;
