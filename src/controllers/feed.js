import pool from '../db/index.js';

export const getFeed = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, 'article' AS type, title, article AS content, author_id, created_on FROM articles
       UNION ALL
       SELECT id, 'gif' AS type, title, image_url AS content, author_id, created_on FROM gifs
       ORDER BY created_on DESC`,
    );

    const data = result.rows.map((row) => {
      const item = {
        id: row.id,
        type: row.type,
        createdOn: row.created_on,
        title: row.title,
        authorId: row.author_id,
      };
      if (row.type === 'gif') {
        item.url = row.content;
      } else {
        item.article = row.content;
      }
      return item;
    });

    return res.status(200).json({ status: 'success', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};