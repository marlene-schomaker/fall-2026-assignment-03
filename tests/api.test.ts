import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Agile Issue Tracker API Integration Tests', () => {
  describe('User Endpoints', () => {
    it('should successfully create a new user (POST /users)', async () => {
      const response = await request(app)
        .post('/users')
        .send({
          name: 'Jane Doe',
          email: 'jane.doe@example.com'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Jane Doe');
      expect(response.body.email).toBe('jane.doe@example.com');
    });

    it('should return 404 when fetching a non-existent user', async () => {
      const response = await request(app).get('/users/99999');
      expect(response.status).toBe(404);
    });
  });

  describe('Ticket Endpoints & Auth Middleware', () => {
    it('should return 401 Unauthorized when X-User-Id is missing on ticket creation', async () => {
      const response = await request(app)
        .post('/tickets')
        .send({
          title: 'Secure Bug Title',
          description: 'This shouldn\'t save without a header'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('X-User-Id header is missing');
    });

    it('should successfully create a ticket when a valid X-User-Id header is supplied', async () => {
      const userRes = await request(app)
        .post('/users')
        .send({ name: 'Developer', email: 'dev@example.com' });

      const userId = userRes.body.id;

      const response = await request(app)
        .post('/tickets')
        .set('X-User-Id', userId.toString())
        .send({
          title: 'Fix Login Crash',
          description: 'App crashes on invalid password input'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.creator_id).toBe(userId);
      expect(response.body.title).toBe('Fix Login Crash');
    });

    it('should return 404 when looking for a non-existent ticket', async () => {
      const response = await request(app).get('/tickets/88888');
      expect(response.status).toBe(404);
    });

    it('should respect pagination query parameters limit and offset on GET /tickets', async () => {
      const response = await request(app)
        .get('/tickets')
        .query({ limit: 2, offset: 0 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });
  });
});
