import request from 'supertest';
import jwt from 'jsonwebtoken';
import { expect } from 'chai';
import app from '../src/app.js';
import {
  resetDb, getAdminToken, createUserAndToken, signIn, ADMIN,
} from './helpers.js';

describe('Auth endpoints', () => {
  let adminToken;

  before(async () => {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('Tests must run with NODE_ENV=test');
    }
    await resetDb();
    adminToken = await getAdminToken();
  });

  describe('POST /api/v1/auth/create-user', () => {
    it('lets an admin create a user and does not leak the password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .set('token', adminToken)
        .send({ firstName: 'Ada', email: 'ada@test.com', password: 'secret123' });

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('success');
      expect(res.body.data).to.not.have.property('password');
    });

    it('rejects a request with no token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .send({ firstName: 'Eve', email: 'eve@test.com', password: 'secret123' });

      expect(res.status).to.equal(401);
    });

    it('forbids a non-admin employee from creating users', async () => {
      const employee = await createUserAndToken('employee@test.com');

      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .set('token', employee.token)
        .send({ firstName: 'Eve', email: 'eve@test.com', password: 'secret123' });

      expect(res.status).to.equal(403);
    });

    it('rejects a duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .set('token', adminToken)
        .send({ firstName: 'Ada', email: 'ada@test.com', password: 'secret123' });

      expect(res.status).to.equal(409);
      expect(res.body.status).to.equal('error');
    });

    it('rejects missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/create-user')
        .set('token', adminToken)
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

    it('marks the admin as admin in the token, and employees as not', async () => {
      const admin = await signIn(ADMIN.email, ADMIN.password);
      const employee = await signIn('ada@test.com', 'secret123');

      expect(jwt.decode(admin.token).isAdmin).to.equal(true);
      expect(jwt.decode(employee.token).isAdmin).to.equal(false);
    });
  });
});