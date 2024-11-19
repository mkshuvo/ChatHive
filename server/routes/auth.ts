import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    
    // Check for existing user by email or username
    const existingUser = await userRepository.findOne({ 
      where: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ 
      username, 
      email, 
      password: hashedPassword 
    });
    
    await userRepository.save(newUser);
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser.id
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
