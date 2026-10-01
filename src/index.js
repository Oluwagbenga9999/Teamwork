import express from 'express';
import pool from './db/index.js';
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();

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

app.listen(3000, () => console.log('Server running on port 3000'));
