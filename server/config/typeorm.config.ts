// This file is deprecated - EntityRepository has been removed in TypeORM 0.3+
// Use AppDataSource.getRepository(User) instead of custom repositories
// Keeping this file for reference but it's not used in the application

import { Repository } from 'typeorm';
import { User } from '../entities/User'

// Note: @EntityRepository decorator is deprecated
// Use AppDataSource.getRepository(User) directly in your services
export class UserRepository extends Repository<User> {}