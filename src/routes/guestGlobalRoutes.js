import { Router } from 'express';
import * as guestController from '../controllers/guestController.js';
import { authProtect } from '../middlewares/auth.js';

const router = Router();

router.use(authProtect);

// Rota global para listar todos os convidados do admin
router.get('/', guestController.getAllGuests);

export default router;
