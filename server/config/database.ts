import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Message } from "../entities/Message";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "chatapp",
  password: process.env.DB_PASSWORD || "chatapp123",
  database: process.env.DB_NAME || "chatapp",
  synchronize: true,
  logging: false,
  entities: [User, Message],
  subscribers: [],
  migrations: [],
});