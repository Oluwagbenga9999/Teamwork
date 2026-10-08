import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getFeed } from '../controllers/feed.js';

const router = Router();

router.get('/', auth, getFeed);

export default router;