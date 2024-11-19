import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import { setupSocket } from "./socket/chat";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    setupSocket(io);
    
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
  export default app;