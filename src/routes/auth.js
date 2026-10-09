import { Router } from 'express';
import { createUser, signIn } from '../controllers/auth.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = Router();

router.post('/create-user', auth, admin, createUser);
router.post('/signin', signIn);

export default router;
