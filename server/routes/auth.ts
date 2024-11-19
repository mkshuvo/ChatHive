import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../entities/User';
import { AppDataSource } from '../config/database';
import jwt from 'jsonwebtoken';

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

    const token = jwt.sign({ id: user.id }, "your_secret_key", { expiresIn: "1h" });

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
