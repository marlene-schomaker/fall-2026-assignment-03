import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userIdHeader = req.header('X-User-Id');

  if (!userIdHeader) {
    res.status(401).json({ error: 'Unauthorized: X-User-Id header is missing' });
    return;
  }

  const userId = parseInt(userIdHeader, 10);
  if (isNaN(userId) || userId <= 0) {
    res.status(401).json({ error: 'Unauthorized: X-User-Id must be a valid number' });
    return;
  }

  res.locals.userId = userId;
  
  next();
}
