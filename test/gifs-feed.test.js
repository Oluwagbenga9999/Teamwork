import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import pool from '../src/db/index.js';
import { resetDb, createUserAndToken } from './helpers.js';
import sinon from 'sinon';
import cloudinary from '../src/db/cloudinary.js';

describe('Gif and feed endpoints', () => {
    let userA;
    let userB;
    let gifId;
    let destroyStub;

    before(async () => {
        destroyStub = sinon.stub(cloudinary.uploader, 'destroy').resolves({ result: 'ok' });

        await resetDb();
        userA = await createUserAndToken('a@test.com');
        userB = await createUserAndToken('b@test.com');

        const inserted = await pool.query(
            'INSERT INTO gifs (title, image_url, public_id, author_id) VALUES ($1, $2, $3, $4) RETURNING id',
            ['Funny gif', 'https://example.com/funny.gif', 'teamwork-gifs/funny', userA.userId],
        );
        gifId = inserted.rows[0].id;
    });

    after(() => {
        destroyStub.restore();
    });

    describe('POST /api/v1/gifs validation', () => {
        it('rejects a request with no token', async () => {
            const res = await request(app).post('/api/v1/gifs').field('title', 'x');
            expect(res.status).to.equal(401);
        });

        it('rejects a request with no image file', async () => {
            const res = await request(app)
                .post('/api/v1/gifs')
                .set('token', userA.token)
                .field('title', 'No file here');

            expect(res.status).to.equal(400);
        });

        it('rejects a request with no title', async () => {
            const res = await request(app)
                .post('/api/v1/gifs')
                .set('token', userA.token)
                .field('title', '');

            expect(res.status).to.equal(400);
        });
    });

    describe('Comments and viewing gifs', () => {
        it('lets a user comment on a gif', async () => {
            const res = await request(app)
                .post(`/api/v1/gifs/${gifId}/comment`)
                .set('token', userB.token)
                .send({ comment: 'Haha' });

            expect(res.status).to.equal(201);
            expect(res.body.data.gifTitle).to.equal('Funny gif');
        });

        it('returns 404 when commenting on a missing gif', async () => {
            const res = await request(app)
                .post('/api/v1/gifs/9999/comment')
                .set('token', userB.token)
                .send({ comment: 'Hi' });

            expect(res.status).to.equal(404);
        });

        it('shows a gif with its comments', async () => {
            const res = await request(app)
                .get(`/api/v1/gifs/${gifId}`)
                .set('token', userA.token);

            expect(res.status).to.equal(200);
            expect(res.body.data.url).to.equal('https://example.com/funny.gif');
            expect(res.body.data.comments).to.have.length(1);
        });
    });

    describe('GET /api/v1/feed', () => {
        it('returns articles and gifs, newest first', async () => {
            await request(app)
                .post('/api/v1/articles')
                .set('token', userA.token)
                .send({ title: 'Newest', article: 'Posted last' });

            const res = await request(app)
                .get('/api/v1/feed')
                .set('token', userA.token);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.length(2);
            expect(res.body.data[0].title).to.equal('Newest');
            expect(res.body.data[1].title).to.equal('Funny gif');
        });

        it('rejects a request with no token', async () => {
            const res = await request(app).get('/api/v1/feed');
            expect(res.status).to.equal(401);
        });
    });

    describe('DELETE /api/v1/gifs/:gifId', () => {
        it('forbids another user from deleting it', async () => {
            const res = await request(app)
                .delete(`/api/v1/gifs/${gifId}`)
                .set('token', userB.token);

            expect(res.status).to.equal(403);
        });

        it('lets the author delete it', async () => {
            const res = await request(app)
                .delete(`/api/v1/gifs/${gifId}`)
                .set('token', userA.token);

            expect(res.status).to.equal(200);
            expect(destroyStub.calledOnceWith('teamwork-gifs/funny')).to.equal(true);
        });

        it('returns 404 once it is gone', async () => {
            const res = await request(app)
                .delete(`/api/v1/gifs/${gifId}`)
                .set('token', userA.token);

            expect(res.status).to.equal(404);
        });
    });
});