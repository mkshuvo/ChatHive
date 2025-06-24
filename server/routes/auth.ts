import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });
    
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!user.password) {
      return res.status(400).send("Invalid user data");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal server error");
  }
});

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
    
    // Generate token for immediate login
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "1h" });
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/logout - Logout (client-side token cleanup)
router.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side by removing the token
    // This endpoint can be used for logging purposes or future token blacklisting
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
