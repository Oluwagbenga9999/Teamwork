import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import pool from '../src/db/index.js';

describe('Auth endpoints', () => {
  before(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must run with NODE_ENV=test');
    }
    await pool.query('TRUNCATE users RESTART IDENTITY CASCADE');
  });


  describe('POST /api/v1/auth/create-user', () => {
    it('creates a user and does not leak the password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .send({ firstName: 'Ada', email: 'ada@test.com', password: 'secret123' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.not.have.property('password');
    });

    it('rejects a duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .send({ firstName: 'Ada', email: 'ada@test.com', password: 'secret123' });

      expect(res.status).to.equal(409);
      expect(res.body.status).to.equal('error');
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .send({ email: 'x@test.com' });

      expect(res.status).to.equal(400);
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    it('returns a token for correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({ email: 'ada@test.com', password: 'secret123' });

      expect(res.status).to.equal(200);
      expect(res.body.data).to.have.property('token');
    });

    it('rejects a wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({ email: 'ada@test.com', password: 'wrongpass' });

      expect(res.status).to.equal(401);
    });
  });
});