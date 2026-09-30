import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';

describe('Time Logs Mathematical Aggregation Tests', () => {
  it('should accurately aggregate multiple individual time entries on a single ticket', async () => {
    const userRes = await request(app)
      .post('/users')
      .send({ name: 'QA Engineer', email: 'qa@example.com' });
    const userId = userRes.body.id;

    const ticketRes = await request(app)
      .post('/tickets')
      .set('X-User-Id', userId.toString())
      .send({ title: 'Math Test Ticket', description: 'Testing summation' });
    const ticketId = ticketRes.body.id;
    
    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId.toString())
      .send({ hours: 3 });

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId.toString())
      .send({ hours: 5 });

    await request(app)
      .post(`/tickets/${ticketId}/time`)
      .set('X-User-Id', userId.toString())
      .send({ hours: 4 });

    const aggregateRes = await request(app).get(`/tickets/${ticketId}/time`);

    expect(aggregateRes.status).toBe(200);
    expect(aggregateRes.body).toEqual({
      ticket_id: ticketId,
      total_hours: 12
    });
  });
});
