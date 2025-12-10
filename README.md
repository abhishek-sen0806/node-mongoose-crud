# Node.js CRUD API with MongoDB

A **production-grade** RESTful API built with Node.js, Express, and MongoDB featuring modern industry-standard patterns and best practices.

## 🌟 Features

### Core Features
- **ES Modules** - Modern JavaScript with `import/export` syntax
- **JWT Authentication** - Secure token-based auth with access & refresh tokens
- **Password Security** - bcrypt hashing with 12 salt rounds
- **Role-Based Access Control** - User, Admin, Moderator roles
- **Input Validation** - Joi schema validation with detailed error messages
- **File Upload** - Multer with file type validation and size limits
- **Soft Delete** - User deactivation with restore capability
- **Pagination** - Built-in pagination, sorting, and filtering

### Modern Industry Features
- **Rate Limiting** - Prevent abuse and DDoS attacks
- **Security Headers** - Helmet.js for XSS, CSRF, and other protections
- **Request Logging** - Winston logger with multiple transports
- **API Documentation** - Swagger/OpenAPI auto-generated docs
- **Redis Caching** - Optional caching layer for improved performance
- **Request ID Tracking** - Unique request IDs for distributed tracing
- **Event-Driven Architecture** - Decoupled components with EventEmitter
- **Email Service** - Nodemailer integration for transactional emails
- **Graceful Shutdown** - Proper cleanup of connections on exit
- **Health Checks** - Kubernetes-ready health endpoints
- **Response Compression** - GZIP compression for faster responses
- **MongoDB Query Sanitization** - Prevent NoSQL injection attacks

## 📁 Project Structure

```
node-demo/
├── src/
│   ├── config/
│   │   ├── index.js          # App configuration
│   │   ├── database.js       # MongoDB connection
│   │   └── swagger.js        # Swagger/OpenAPI config
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── listeners/
│   │   └── user.listener.js  # Event handlers
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── requestId.middleware.js
│   │   ├── security.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── models/
│   │   └── user.model.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── cache.service.js   # Redis caching
│   │   ├── email.service.js   # Email handling
│   │   └── event.service.js   # Event emitter
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── helpers.js
│   │   └── logger.js          # Winston logger
│   ├── validators/
│   │   └── user.validator.js
│   ├── app.js
│   └── index.js
├── public/
│   └── uploads/
├── logs/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd node-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env with your settings
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or use MongoDB Atlas
   ```

5. **Run the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access API Documentation**
   ```
   http://localhost:3000/api-docs
   ```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `ACCESS_TOKEN_SECRET` | JWT access token secret | Required in production |
| `ACCESS_TOKEN_EXPIRY` | Access token expiry | `15m` |
| `REFRESH_TOKEN_SECRET` | JWT refresh token secret | Required in production |
| `REFRESH_TOKEN_EXPIRY` | Refresh token expiry | `7d` |
| `REDIS_URL` | Redis connection URL | Optional |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `SMTP_HOST` | SMTP server host | Optional |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASS` | SMTP password | Optional |

## 📚 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Full health status |
| GET | `/api/v1/health/ready` | Readiness probe |
| GET | `/api/v1/health/live` | Liveness probe |

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user | Public |
| POST | `/api/v1/auth/logout` | Logout user | Private |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | Public |
| GET | `/api/v1/auth/me` | Get current user | Private |
| PATCH | `/api/v1/auth/change-password` | Change password | Private |

### Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/v1/users` | Get all users | Admin |
| POST | `/api/v1/users` | Create user | Admin |
| GET | `/api/v1/users/:id` | Get user by ID | Admin/Owner |
| PATCH | `/api/v1/users/:id` | Update user | Admin/Owner |
| DELETE | `/api/v1/users/:id` | Soft delete | Admin |
| DELETE | `/api/v1/users/:id/permanent` | Hard delete | Admin |
| PATCH | `/api/v1/users/:id/restore` | Restore user | Admin |
| PATCH | `/api/v1/users/:id/avatar` | Update avatar | Owner |
| GET | `/api/v1/users/search` | Search users | Private |

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'
```

### Get Users (Admin)
```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10&sort=-createdAt" \
  -H "Authorization: Bearer <access_token>"
```

### Health Check
```bash
curl http://localhost:3000/api/v1/health
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Short-lived access + long-lived refresh tokens
- **HTTP-Only Cookies**: Tokens stored in secure cookies
- **Rate Limiting**: Prevents brute force and DDoS attacks
- **Security Headers**: Helmet.js (CSP, HSTS, XSS protection, etc.)
- **Input Validation**: All inputs validated with Joi
- **Query Sanitization**: Prevents NoSQL injection
- **Request ID Tracking**: Enables distributed tracing

## 🏗️ Architecture Patterns

- **MVC Pattern**: Model-View-Controller separation
- **Factory Pattern**: Response/Error generation
- **Singleton Pattern**: Database, Cache connections
- **Observer Pattern**: Event-driven architecture
- **Middleware Chain**: Request processing pipeline
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Service layer

## 🚀 Performance Features

- **Response Compression**: GZIP compression
- **Redis Caching**: Optional query caching
- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: MongoDB connection pool
- **Parallel Queries**: Promise.all for concurrent operations

## 📊 Monitoring & Logging

- **Winston Logger**: File and console logging
- **Request Logging**: Morgan HTTP request logs
- **Request ID Tracking**: Correlation IDs for tracing
- **Health Endpoints**: Kubernetes-ready probes
- **Error Tracking**: Centralized error handling

## 🐳 Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongoose` | MongoDB ODM |
| `bcrypt` | Password hashing |
| `jsonwebtoken` | JWT handling |
| `joi` | Validation |
| `multer` | File uploads |
| `helmet` | Security headers |
| `express-rate-limit` | Rate limiting |
| `winston` | Logging |
| `ioredis` | Redis client |
| `nodemailer` | Email sending |
| `swagger-jsdoc` | API documentation |
| `compression` | Response compression |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
