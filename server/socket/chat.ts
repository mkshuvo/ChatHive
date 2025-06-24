import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/database";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const messageRepository = () => AppDataSource.getRepository(Message);
const userRepository = () => AppDataSource.getRepository(User);

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const setupSocket = (io: Server) => {
  // Track online users
  const onlineUsers = new Set<string>();

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await userRepository().findOne({ where: { id: decoded.id } });
      
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user.id;
      socket.username = user.username;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.username} connected with socket ID: ${socket.id}`);
    
    if (socket.userId) {
      // Add user to online users
      onlineUsers.add(socket.userId);
      
      // Broadcast user is online
      socket.broadcast.emit("user_online", socket.userId);
      
      // Send current online users to the newly connected user
      socket.emit("online_users", Array.from(onlineUsers));
    }
    
    // Join user to their own room
    socket.join(`user_${socket.userId}`);

    // Handle joining a chat room
    socket.on("join_chat", (otherUserId: string) => {
      const roomId = [socket.userId, otherUserId].sort().join("_");
      socket.join(roomId);
      console.log(`User ${socket.username} joined chat room: ${roomId}`);
    });

    // Handle sending messages
    socket.on("send_message", async (data: { receiverId: string; content: string }) => {
      try {
        const { receiverId, content } = data;
        
        if (!receiverId || !content || !socket.userId) {
          socket.emit("error", { message: "Receiver ID and content are required" });
          return;
        }

        const sender = await userRepository().findOne({ where: { id: socket.userId } });
        const receiver = await userRepository().findOne({ where: { id: receiverId } });

        if (!receiver || !sender) {
          socket.emit("error", { message: "Receiver or sender not found" });
          return;
        }

        const message = messageRepository().create({
          content,
          sender,
          receiver,
        });

        const savedMessage = await messageRepository().save(message);
        
        // Get message with full details
        const messageWithDetails = await messageRepository()
          .createQueryBuilder("message")
          .leftJoinAndSelect("message.sender", "sender")
          .leftJoinAndSelect("message.receiver", "receiver")
          .where("message.id = :id", { id: savedMessage.id })
          .getOne();

        // Create room ID for this chat
        const roomId = [socket.userId, receiverId].sort().join("_");
        
        // Emit to the chat room
        io.to(roomId).emit("new_message", messageWithDetails);

      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.username} disconnected`);
      
      if (socket.userId) {
        // Remove user from online users
        onlineUsers.delete(socket.userId);
        
        // Broadcast user is offline
        socket.broadcast.emit("user_offline", socket.userId);
      }
    });
  });
};