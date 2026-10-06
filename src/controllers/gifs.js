import pool from '../db/index.js';
import multer from 'multer';
import cloudinary from '../db/cloudinary.js';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});


const createGif = async (req, res) => {
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
}

const deleteGif = async (req, res) => {
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
        await pool.query('DELETE FROM gifs WHERE id = $1', [gifId]);
        if (publicId) {
            await cloudinary.uploader.destroy(publicId)
        }

        return res.status(200).json({
            status: 'success',
            data: { message: 'gif post successfully deleted' },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', error: 'Server error' });
    }
}

const commentOnGif = async (req, res) => {
    const gifId = Number(req.params.gifId);
    const { comment } = req.body;

    if (!Number.isInteger(gifId)) {
        return res.status(400).json({ status: 'error', error: 'Invalid gif id' });
    }

    if (!comment) {
        return res.status(400).json({ status: 'error', error: 'comment is required' });
    }

    try {
        const found = await pool.query(
            'SELECT title FROM gifs WHERE id = $1',
            [gifId],
        );

        if (found.rows.length === 0) {
            return res.status(404).json({ status: 'error', error: 'Gif not found' });
        }

        const result = await pool.query(
            'INSERT INTO gif_comments (comment, gif_id, author_id) VALUES ($1, $2, $3) RETURNING comment, created_on',
            [comment, gifId, req.user.userId],
        );

        return res.status(201).json({
            status: 'success',
            data: {
                message: 'Comment successfully created',
                createdOn: result.rows[0].created_on,
                gifTitle: found.rows[0].title,
                comment: result.rows[0].comment,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: 'error', error: 'Server error' });
    }
}

const getGif = async (req, res) => {
    const gifId = Number(req.params.gifId);

    if (!Number.isInteger(gifId)) {
        return res.status(400).json({ status: 'error', error: 'Invalid gif id' });
    }

    try {
        const found = await pool.query(
            'SELECT id, created_on, title, image_url FROM gifs WHERE id = $1',
            [gifId],
        );

        if (found.rows.length === 0) {
            return res.status(404).json({ status: 'error', error: 'Gif not found' });
        }

        const commentResult = await pool.query(
            'SELECT id, comment, author_id FROM gif_comments WHERE gif_id = $1 ORDER BY created_on ASC',
            [gifId],
        );

        const row = found.rows[0];

        return res.status(200).json({
            status: 'success',
            data: {
                id: row.id,
                createdOn: row.created_on,
                title: row.title,
                url: row.image_url,
                comments: commentResult.rows.map((c) => ({
                    commentId: c.id,
                    authorId: c.author_id,
                    comment: c.comment,
                })),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'error', error: 'Server error' });
    }
};


export {
    createGif, getGif, deleteGif, commentOnGif, upload,
}