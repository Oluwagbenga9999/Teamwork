import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createGif, deleteGif, commentOnGif,
} from '../controllers/gifs.js';

const router = Router();

router.post('/', auth, createGif);
router.delete('/:gifId', auth, deleteGif);
router.post('/:gifId/comment', auth, commentOnGif);

export default router;