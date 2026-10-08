import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { resetDb, createUserAndToken } from './helpers.js';

describe('Article endpoints', () => {
    let userA;
    let userB;
    let articleId;

    before(async () => {
        await resetDb();
        userA = await createUserAndToken('a@test.com');
        userB = await createUserAndToken('b@test.com');
    });

    describe('POST /api/v1/articles', () => {
    it('creates an article for a signed-in user', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('token', userA.token)
        .send({ title: 'Hello', article: 'My first article' });

      expect(res.status).to.equal(201);
      expect(res.body.data).to.have.property('articleId');
      articleId = res.body.data.articleId;
    });

    it('rejects a request with no token', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .send({ title: 'Hello', article: 'Body' });

      expect(res.status).to.equal(401);
    });

    it('rejects a missing title', async () => {
      const res = await request(app)
        .post('/api/v1/articles')
        .set('token', userA.token)
        .send({ article: 'Body only' });

      expect(res.status).to.equal(400);
    });
  });

  describe('PATCH /api/v1/articles/:articleId', () => {
    it('lets the author edit their article', async () => {
      const res = await request(app)
        .patch(`/api/v1/articles/${articleId}`)
        .set('token', userA.token)
        .send({ title: 'Updated', article: 'New body' });

      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal('Updated');
    });

    it('forbids another user from editing it', async () => {
      const res = await request(app)
        .patch(`/api/v1/articles/${articleId}`)
        .set('token', userB.token)
        .send({ title: 'Hacked', article: 'Nope' });

      expect(res.status).to.equal(403);
    });

    it('returns 404 for an article that does not exist', async () => {
      const res = await request(app)
        .patch('/api/v1/articles/9999')
        .set('token', userA.token)
        .send({ title: 'x', article: 'y' });

      expect(res.status).to.equal(404);
    });

    it('returns 400 for an invalid id', async () => {
      const res = await request(app)
        .patch('/api/v1/articles/abc')
        .set('token', userA.token)
        .send({ title: 'x', article: 'y' });

      expect(res.status).to.equal(400);
    });
  });

   describe('Comments and viewing', () => {
    it('lets a user comment on an article', async () => {
      const res = await request(app)
        .post(`/api/v1/articles/${articleId}/comment`)
        .set('token', userB.token)
        .send({ comment: 'Nice one' });

      expect(res.status).to.equal(201);
      expect(res.body.data.comment).to.equal('Nice one');
    });

    it('rejects an empty comment', async () => {
      const res = await request(app)
        .post(`/api/v1/articles/${articleId}/comment`)
        .set('token', userB.token)
        .send({});

      expect(res.status).to.equal(400);
    });

    it('returns 404 when commenting on a missing article', async () => {
      const res = await request(app)
        .post('/api/v1/articles/9999/comment')
        .set('token', userB.token)
        .send({ comment: 'Hello' });

      expect(res.status).to.equal(404);
    });

    it('shows an article with its comments', async () => {
      const res = await request(app)
        .get(`/api/v1/articles/${articleId}`)
        .set('token', userA.token);

      expect(res.status).to.equal(200);
      expect(res.body.data.comments).to.have.length(1);
      expect(res.body.data.comments[0].comment).to.equal('Nice one');
    });

    it('returns 404 when viewing a missing article', async () => {
      const res = await request(app)
        .get('/api/v1/articles/9999')
        .set('token', userA.token);

      expect(res.status).to.equal(404);
    });
  });

  describe('DELETE /api/v1/articles/:articleId', () => {
    it('forbids another user from deleting it', async () => {
      const res = await request(app)
        .delete(`/api/v1/articles/${articleId}`)
        .set('token', userB.token);

      expect(res.status).to.equal(403);
    });

    it('lets the author delete it', async () => {
      const res = await request(app)
        .delete(`/api/v1/articles/${articleId}`)
        .set('token', userA.token);

      expect(res.status).to.equal(200);
    });

    it('returns 404 once it is gone', async () => {
      const res = await request(app)
        .delete(`/api/v1/articles/${articleId}`)
        .set('token', userA.token);

      expect(res.status).to.equal(404);
    });
  });
});