import pool from '../db/index.js';

const createArticle = async (req, res) => {
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
}

const editArticle = async (req, res) => {
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
}

const deleteArticle = async (req, res) => {
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
}

const commentOnArticle = async (req, res) => {
    const articleId = Number(req.params.articleId);
  const { comment } = req.body;

  if (!Number.isInteger(articleId)) {
    return res.status(400).json({ status: 'error', error: 'Invalid article id' });
  }

  if (!comment) {
    return res.status(400).json({ status: 'error', error: 'comment is required' });
  }

  try {
    const found = await pool.query(
      'SELECT title, article FROM articles WHERE id = $1',
      [articleId],
    );

    if (found.rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Article not found' });
    }

    const result = await pool.query(
      'INSERT INTO article_comments (comment, article_id, author_id) VALUES ($1, $2, $3) RETURNING comment, created_on',
      [comment, articleId, req.user.userId],
    );

    return res.status(201).json({
      status: 'success',
      data: {
        message: 'Comment successfully created',
        createdOn: result.rows[0].created_on,
        articleTitle: found.rows[0].title,
        article: found.rows[0].article,
        comment: result.rows[0].comment,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
}

export {
  createArticle, editArticle, deleteArticle, commentOnArticle,
}