import request from 'supertest';
import { createServer } from "http";
import express from "express";
import { AppDataSource } from '../server/config/database';
import { User } from '../server/entities/User';
import { Message } from '../server/entities/Message';
import bcrypt from 'bcryptjs';
import cors from "cors";
import authRoutes from '../server/routes/auth';

let app: express.Application;
let server: any;

beforeAll(async () => {
  // Initialize database
  await AppDataSource.initialize();

  // Create express app for testing
  app = express();
  app.use(cors({ origin: "*" }));
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  // Create HTTP server
  server = createServer(app);
});

beforeEach(async () => {
  // Clear tables in correct order (respecting foreign key constraints)
  const messageRepository = AppDataSource.getRepository(Message);
  const userRepository = AppDataSource.getRepository(User);
  
  await messageRepository.delete({});  // Delete all messages first
  await userRepository.delete({});     // Then delete all users
});

afterAll(async () => {
  // Close server and database connection
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await AppDataSource.destroy();
});

describe('User Registration', () => {
  const validUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test' });
    
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username, email, and password are required');
  });

  it('should return 400 if email is already registered', async () => {
    const userRepository = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const existingUser = userRepository.create({
      username: 'existing',
      email: 'test@example.com',
      password: hashedPassword
    });
    await userRepository.save(existingUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered');
  });

  it('should return 400 if username is already taken', async () => {
    const userRepository = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const existingUser = userRepository.create({
      username: 'testuser',
      email: 'existing@example.com',
      password: hashedPassword
    });
    await userRepository.save(existingUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'new@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username already taken');
  });

  it('should return 201 if user is registered successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.userId).toBeDefined();

    // Verify user was actually created
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: validUser.email } });
    expect(user).toBeDefined();
    expect(user?.username).toBe(validUser.username);
  });

  it('should return 500 if internal server error occurs', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => Promise.reject(new Error('Mocked error')));
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal server error');
  });
});