import { Router, Request, Response, NextFunction } from 'express';
import * as usersDal from '../dal/users.js';

const router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersDal.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const user = await usersDal.getUserById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required fields' });
      return;
    }

    const newUser = await usersDal.createUser({ name, email });
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

export default router;
