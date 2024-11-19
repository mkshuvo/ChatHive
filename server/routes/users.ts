import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const router = Router();

// GET /api/users - Fetch all users (excluding the current user)
router.get('/', async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ['id', 'username', 'email', 'avatarUrl']
    });

    // Map the users to match the chat interface
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    }));

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/users/:id - Fetch a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ 
      where: { id },
      select: ['id', 'username', 'email', 'avatarUrl']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return only the necessary fields
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    };

    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
