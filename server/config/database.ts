import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Message } from "../entities/Message";

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || process.env.DB_PORT || "5432"),
  username: process.env.POSTGRES_USER || process.env.DB_USER || "chatapp",
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "chatapp123",
  database: process.env.POSTGRES_DB || process.env.DB_NAME || "chatapp",
  url: process.env.DATABASE_URL,
  synchronize: !isProduction, // Only synchronize in development
  logging: !isProduction, // Only log in development
  entities: [User, Message],
  subscribers: [],
  migrations: [],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});