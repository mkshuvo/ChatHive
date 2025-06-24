import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/database";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const messageRepository = AppDataSource.getRepository(Message);
const userRepository = AppDataSource.getRepository(User);

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocket = (io: Server) => {
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  const userSockets = new Map<string, string>();

  io.on("connection", (socket: AuthenticatedSocket) => {
    if (socket.userId) {
      userSockets.set(socket.userId, socket.id);
    }

    socket.on("private-message", async (data: { receiverId: string; content: string; mediaUrl?: string }) => {
      try {
        if (!socket.userId) return;

        const receiver = await userRepository.findOneBy({ id: data.receiverId });
        if (!receiver) {
          socket.emit("error", "Receiver not found");
          return;
        }

        const message = messageRepository.create({
          content: data.content,
          mediaUrl: data.mediaUrl,
          sender: { id: socket.userId },
          receiver: receiver,
        });

        await messageRepository.save(message);

        const receiverSocketId = userSockets.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("new-message", {
            ...message,
            senderId: socket.userId,
          });
        }

        socket.emit("message-sent", message);
      } catch (error) {
        socket.emit("error", "Error sending message");
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        userSockets.delete(socket.userId);
      }
    });
  });
};