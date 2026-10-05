import { Router } from 'express';
import auth from '../middleware/auth.js';
import {
  createArticle, editArticle, deleteArticle, commentOnArticle,
} from '../controllers/articles.js';

const router = Router();

router.post('/', auth, createArticle);
router.patch('/:articleId', auth, editArticle);
router.delete('/:articleId', auth, deleteArticle);
router.post('/:articleId/comment', auth, commentOnArticle);

export default router;