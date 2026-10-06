import express from 'express';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import gifRoutes from './routes/gifs.js';
import feedRoutes from './routes/feed.js';


const app = express();

app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/gifs', gifRoutes);
app.use('/api/v1/feed', feedRoutes);

export default app;