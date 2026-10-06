import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/index.js';

export const resetDb = () => pool.query('TRUNCATE users RESTART IDENTITY CASCADE');

export const createUserAndToken = async (email) => {
  await request(app)
    .post('/api/v1/auth/create-user')
    .send({ firstName: 'Test', email, password: 'secret123' });

  const res = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email, password: 'secret123' });

  return { token: res.body.data.token, userId: res.body.data.userId };
};