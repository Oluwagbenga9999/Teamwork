import express from 'express';
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import gifRoutes from './routes/gifs.js';
import feedRoutes from './routes/feed.js';
import swaggerSpec from '../docs/swagger.js';
import cors from 'cors';


const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
}));

app.use(express.json());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/articles', articleRoutes);
app.use('/api/v1/gifs', gifRoutes);
app.use('/api/v1/feed', feedRoutes);

const swaggerPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Teamwork API docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>SwaggerUIBundle({ url: '/api-docs/swagger.json', dom_id: '#swagger-ui' });</script>
</body>
</html>`;

app.get('/', (req, res) => {
  res.json({ status: 'success', data: { message: 'Teamwork API', docs: '/api-docs' } });
});
app.get('/api-docs/swagger.json', (req, res) => res.json(swaggerSpec));
app.get('/api-docs', (req, res) => res.type('html').send(swaggerPage));

export default app;