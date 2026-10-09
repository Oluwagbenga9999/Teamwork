import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import pool from '../src/db/index.js';

export const ADMIN = { email: 'admin@test.com', password: 'passkey4admin' };

export const resetDb = async () => {
  await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  const hash = await bcrypt.hash(ADMIN.password, 4);
  await pool.query(
    'INSERT INTO users (first_name, email, password, is_admin) VALUES ($1, $2, $3, TRUE)',
    ['Admin', ADMIN.email, hash],
  );
};

export const signIn = async (email, password) => {
  const res = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email, password });

  return { token: res.body.data.token, userId: res.body.data.userId };
};

export const getAdminToken = async () => {
  const { token } = await signIn(ADMIN.email, ADMIN.password);
  return token;
};

export const createUserAndToken = async (email) => {
  const adminToken = await getAdminToken();

  await request(app)
    .post('/api/v1/auth/create-user')
    .set('token', adminToken)
    .send({ firstName: 'Test', email, password: 'secret123' });

  return signIn(email, 'secret123');
};