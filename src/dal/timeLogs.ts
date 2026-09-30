import { db } from '../db/database.js';
import { sql } from 'kysely';

export interface TimeLog {
  id: number;
  ticket_id: number;
  user_id: number;
  hours: number;
  logged_at: Date;
}

export async function insertTimeLog(
  ticketId: number,
  userId: number,
  hours: number
): Promise<TimeLog> {
  const result = await db
    .insertInto('time_logs')
    .values({
      ticket_id: ticketId,
      user_id: userId,
      hours: hours,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result as unknown as TimeLog;
}

export async function getTotalHoursForTicket(ticketId: number): Promise<number> {
  const result = await db
    .selectFrom('time_logs')
    .select(({ fn }) => [
      fn.sum<string | number>('hours').as('total_hours')
    ])
    .where('ticket_id', '=', ticketId)
    .executeTakeFirst();

  const total = result?.total_hours;
  if (!total) return 0;

  return typeof total === 'string' ? parseInt(total, 10) : total;
}
