import { Router } from 'express';
import { createUser, signIn } from '../controllers/auth.js';

const router = Router();

router.post('/create-user', createUser);
router.post('/signin', signIn);

export default router;
