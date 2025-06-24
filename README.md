# ChatHive

A modern, full-stack real-time chat application built with Next.js, Express, TypeORM, PostgreSQL, and Docker.

---

## 🚀 Project Overview
ChatHive is a robust chat platform featuring real-time private messaging, user authentication, online presence, and a beautiful, responsive UI. The project is containerized for easy local development and deployment.

---

## 📦 Features
- **User Authentication**: Secure registration, login, JWT-based sessions, and logout.
- **Real-time Messaging**: Instant private chat using Socket.IO.
- **User Presence**: Online/offline status indicators.
- **Message History**: Persistent chat history between users.
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components.
- **API & Database**: RESTful endpoints, PostgreSQL with TypeORM.
- **Dockerized**: Multi-container setup for backend, frontend, and database.
- **Health Checks**: Docker healthchecks for all services.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Zustand
- **Backend**: Express.js, TypeScript, TypeORM, Socket.IO
- **Database**: PostgreSQL 14
- **DevOps**: Docker, Docker Compose

---

## 📚 API Progress
This API is **feature-complete for core chat and authentication**, but further development is encouraged for production use. See the suggestions below for next steps.

### Implemented Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — User login
- `GET /api/auth/me` — Get current user info
- `POST /api/auth/logout` — Logout (client-side token cleanup)
- `GET /api/chat/users` — List all users (except current)
- `GET /api/chat/messages/:userId` — Get chat history with a user
- `POST /api/chat/messages` — Send a message
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get user by ID
- `GET /api/health` — Health check

### Real-time Events (Socket.IO)
- `connection`, `disconnect`
- `join_chat`, `send_message`, `new_message`
- `user_online`, `user_offline`, `online_users`
- `error`

---

## 🏗️ Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start
```bash
git clone <your-repo-url>
cd ChatHive
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: localhost:5434

### Environment Variables
All environment variables are set in `docker-compose.yml` and can be overridden as needed.

---

## 📝 Further Development & Recommendations
This project is a solid foundation, but for production use, consider the following enhancements:

### Security
- Rate limiting and brute-force protection
- CORS configuration for allowed origins
- Secure environment variable management
- HTTPS/SSL setup

### Features
- Group chat and channels
- File/image upload and sharing
- Message reactions and editing
- Push notifications
- User profile management

### Performance & Scalability
- Message pagination and lazy loading
- Redis for caching and session management
- Database indexing and query optimization

### Monitoring & Maintenance
- Centralized logging (e.g., Winston, Morgan)
- Error tracking and alerting
- Health and performance monitoring

---

## 🤝 Contributing
Pull requests and issues are welcome! Please open an issue to discuss your ideas or report bugs.

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

---

**ChatHive — Professional, scalable, and ready for your next chat project.**
