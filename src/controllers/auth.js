import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const createUser = async (req, res) => {
  const {
    firstName, lastName, email, password, gender, jobRole, department, address,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      status: 'error',
      error: 'firstName, lastName, email and password are required',
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, gender, job_role, department, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, is_admin`,
      [firstName, lastName, email, hash, gender, jobRole, department, address],
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
    );

    return res.status(201).json({
      status: 'success',
      data: { message: 'User account successfully created', token, userId: user.id },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ status: 'error', error: 'Email already exists' });
    }
    console.error(error);
    return res.status(500).json({ status: 'error', error: 'Server error' });
  }
};

const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            status: 'error',
            error: 'email and password are required',
        });
    }

    try {
        const result = await pool.query(
            'SELECT id, email, password, is_admin FROM users WHERE email = $1',
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
            { userId: user.id, email: user.email, isAdmin: user.is_admin },
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
}

export  {createUser, signIn}