import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createGif, getGif, deleteGif, commentOnGif, upload,
} from '../controllers/gifs.js';


const router = Router();

router.post('/', auth, upload.single('image'), createGif);
router.get('/:gifId', auth, getGif);
router.delete('/:gifId', auth, deleteGif);
router.post('/:gifId/comment', auth, commentOnGif);

export default router;