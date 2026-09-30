import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as ticketsDal from '../dal/tickets.js';
import * as timeLogsDal from '../dal/timeLogs.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawLimit = req.query.limit ? String(req.query.limit) : undefined;
    const rawOffset = req.query.offset ? String(req.query.offset) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    let limit = rawLimit ? parseInt(rawLimit, 10) : 10;
    let offset = rawOffset ? parseInt(rawOffset, 10) : 0;

    if (isNaN(limit) || limit < 0) limit = 10;
    if (isNaN(offset) || offset < 0) offset = 0;

    const tickets = await ticketsDal.getTickets({ limit, offset, status });
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }

    const ticket = await ticketsDal.getTicketById(id);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(ticket);
  } catch (error) {
    next(error);
  }
});


router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const creatorId = res.locals.userId;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTicket = await ticketsDal.createTicket({
      title,
      description,
      creator_id: creatorId,
    });

    res.status(201).json(newTicket);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }

    if (!status) {
      res.status(400).json({ error: 'Status string is required' });
      return;
    }

    const updatedTicket = await ticketsDal.updateTicketStatus(id, status);
    if (!updatedTicket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.status(200).json(updatedTicket);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/time', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { hours } = req.body;
    const userId = res.locals.userId;

    if (isNaN(ticketId)) {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }

    if (typeof hours !== 'number' || hours <= 0) {
      res.status(400).json({ error: 'Hours must be a valid positive number' });
      return;
    }

    const ticket = await ticketsDal.getTicketById(ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const newTimeLog = await timeLogsDal.insertTimeLog(ticketId, userId, hours);
    res.status(201).json(newTimeLog);
  } catch (error) {
    next(error);
  }
});


router.get('/:id/time', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticketId = parseInt(req.params.id, 10);

    if (isNaN(ticketId)) {
      res.status(400).json({ error: 'Invalid ticket ID format' });
      return;
    }

    const ticket = await ticketsDal.getTicketById(ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    const totalHours = await timeLogsDal.getTotalHoursForTicket(ticketId);

    res.status(200).json({
      ticket_id: ticketId,
      total_hours: totalHours
    });
  } catch (error) {
    next(error);
  }
});

export default router;
