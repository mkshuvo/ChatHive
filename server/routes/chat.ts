import { Router } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Message } from '../entities/Message';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all users except the current user (for chat list)
router.get('/users', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const userRepository = AppDataSource.getRepository(User);
    
    const users = await userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId })
      .select(['user.id', 'user.username', 'user.email', 'user.avatarUrl'])
      .getMany();

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get chat history between current user and another user
router.get('/messages/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const otherUserId = req.params.userId;
    
    const messageRepository = AppDataSource.getRepository(Message);
    
    const messages = await messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.sender.id = :currentUserId AND message.receiver.id = :otherUserId) OR (message.sender.id = :otherUserId AND message.receiver.id = :currentUserId)',
        { currentUserId, otherUserId }
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user?.id;

    if (!receiverId || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const messageRepository = AppDataSource.getRepository(Message);

    // Verify receiver exists
    const receiver = await userRepository.findOne({ where: { id: receiverId } });
    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    const sender = await userRepository.findOne({ where: { id: senderId } });
    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    
    const message = messageRepository.create({
      content,
      sender,
      receiver,
      createdAt: new Date()
    });

    const savedMessage = await messageRepository.save(message);
    
    // Include sender and receiver info in response
    const messageWithDetails = await messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.id = :id', { id: savedMessage.id })
      .getOne();

    res.status(201).json(messageWithDetails);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
