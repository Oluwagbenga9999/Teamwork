import express from 'express';
import pool from './db/index.js';
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from './middleware/auth.js';
import multer from 'multer';
import cloudinary from './db/cloudinary.js';

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Teamwork API is running' });
});

app.get('/hello', async (req, res) => {
    res.json({ message: 'Hello Dev'})
})

app.post('/users', async (req, res) => {
    const { firstName, email, password } = req.body;

    if (!firstName || !email || !password) {
        return res.status(400).json({
            status: 'error',
            error: 'firstName, email and password are required',
        });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (first_name, email, password) VALUES ($1, $2, $3) RETURNING id, first_name, email',
            [firstName, email, hash],
        );
        return res.status(201).json({ status: 'success', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({status: 'error', error: 'Email already exists' });
        }
        console.log(error)
        return res.status(500).json({ status: 'error', error: 'Server error'});
    }
});

app.get('/db-test', async (req, res) => {
    const result = await pool.query('SELECT * FROM users');
    res.status(201).json({ status: 'success', data: result.rows });
});

app.post('/auth/signin', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            error: 'email and password are required',
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, email, password FROM users WHERE email = $1',
            [email],
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ status: 'error', error: 'Invalid email or password'});
        }

        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ status: 'error', error: 'Invalid email or password'});
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
        );

        return res.status(200).json({
            status: 'success',
            data: { token, userId: user.id },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', error: 'Server error' });
    }
});

app.get('/protected', auth, (req, res) => {
    res.json({ status: 'success', data: { message: 'You are in', user: req.user } });
});

app.post('/articles', auth, async (req, res) => {
  const { title, article } = req.body;

  if (!title || !article) {
    return res.status(400).json({
      status: 'error',
      error: 'title and article are required',
    });
  }

  try {
    const result = await pool.query(
      'INSERT INTO articles (title, article, author_id) VALUES ($1, $2, $3) RETURNING id, title, created_on',
      [title, article, req.user.userId],
    );
    const created = result.rows[0];

    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Article successfully posted',
        articleId: created.id,
        createdOn: created.created_on,
        title: created.title,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

app.patch('/articles/:articleId', auth, async (req, res) => {
    const articleId = Number(req.params.articleId);
    const { title, article } = req.body;

    if (!Number.isInteger(articleId)) {
        return res.status(400).json({ status: 'error', error: 'Invalid article id' });
    }

    if (!title || !article) {
        return res.status(400).json({
            status: 'eror',
            error: 'title and article are required',
        });
    }

    try {
        const found = await pool.query(
            'SELECT author_id FROM articles WHERE id = $1',
            [articleId],
        );

        if (found.rows.length === 0) {
            return res.status(404).json({ status: 'error', error: 'article not found' });
        }

        if (found.rows[0].author_id !== req.user.userId) {
            return res.status(403).json({ status: 'error', error: 'you can only edit your own articles'});
        }

        const result = await pool.query(
            'UPDATE articles SET title = $1, article = $2 WHERE id = $3 RETURNING title, article',
            [title, article, articleId],
        );

        return res.status(200).json({
            status: 'Success',
            data: {
                message: 'Article successfully updated',
                title: result.rows[0].title,
                article: result.rows[0].article,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 'error', error: 'Server error'})
    }
});

app.delete('/articles/:articleId', auth, async (req, res) => {
  const articleId = Number(req.params.articleId);

  if (!Number.isInteger(articleId)) {
    return res.status(400).json({ status: 'error', error: 'Invalid article id' });
  }

  try {
    const found = await pool.query(
      'SELECT author_id FROM articles WHERE id = $1',
      [articleId],
    );

    if (found.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Article not found' });
    }

    if (found.rows[0].author_id !== req.user.userId) {
      return res.status(403).json({ status: 'error', error: 'You can only delete your own articles' });
    }

    await pool.query('DELETE FROM articles WHERE id = $1', [articleId]);

    return res.status(200).json({
      status: 'success',
      data: { message: 'Article successfully deleted' },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

app.post('/gifs', auth, upload.single('image'), async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ status: 'error', error: 'title is required' });
  }

  if (!req.file) {
    return res.status(400).json({ status: 'error', error: 'image file is required' });
  }

  if (req.file.mimetype !== 'image/gif') {
    return res.status(400).json({ status: 'error', error: 'Only GIF images are allowed' });
  }

  try {
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploaded = await cloudinary.uploader.upload(dataUri, { folder: 'teamwork-gifs' });

    const result = await pool.query(
      'INSERT INTO gifs (title, image_url, author_id, public_id) VALUES ($1, $2, $3, $4) RETURNING id, title, image_url, created_on, public_id',
      [title, uploaded.secure_url, req.user.userId, uploaded.public_id],
    );
    const gif = result.rows[0];

    return res.status(201).json({
      status: 'success',
      data: {
        gifId: gif.id,
        message: 'GIF image successfully posted',
        createdOn: gif.created_on,
        title: gif.title,
        imageUrl: gif.image_url,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

app.delete('/gifs/:gifId', auth, async (req, res) => {
  const gifId = Number(req.params.gifId);

  if (!Number.isInteger(gifId)) {
    return res.status(400).json({ status: 'error', error: 'Invalid gif id' });
  }

  try {
    const found = await pool.query(
      'SELECT author_id, public_id FROM gifs WHERE id = $1',
      [gifId],
    );

    if (found.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Gif not found' });
    }

    if (found.rows[0].author_id !== req.user.userId) {
      return res.status(403).json({ status: 'error', error: 'You can only delete your own gifs' });
    }

    const publicId = found.rows[0].public_id;
    console.log(publicId);
    await cloudinary.uploader.destroy(publicId)
    await pool.query('DELETE FROM gifs WHERE id = $1', [gifId]);

    return res.status(200).json({
      status: 'success',
      data: { message: 'gif post successfully deleted' },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
