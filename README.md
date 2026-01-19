# EXPRESS TYPESCRIPT TEMPLATE

A **production-ready Express.js + TypeScript** backend template with built-in security, rate limiting, queue processing, Redis, and MongoDB (Mongoose). Designed for scalable and maintainable APIs.

## ✨ Key Features

* **Express 5 + TypeScript**
* **MongoDB (Mongoose)** integration
* **Redis + BullMQ** for background jobs / queues
* **JWT Authentication**
* **Security by default** (Helmet, HPP, XSS protection)
* **Rate limiting**
* **CORS & Compression**
* **Environment-based configuration (.env)**
* **Developer-friendly** (nodemon + ts-node)

## 📦 Dependencies

### Production Dependencies

* **express** – HTTP server framework
* **mongoose** – MongoDB ODM
* **ioredis** – Redis client
* **bullmq** – Queue & background job processing
* **jsonwebtoken** – JWT authentication
* **axios** – HTTP client
* **dotenv** – Environment variable loader
* **helmet** – Secure HTTP headers
* **cors** – Cross-Origin Resource Sharing
* **compression** – Gzip compression
* **express-rate-limit** – API rate limiting
* **hpp** – HTTP Parameter Pollution protection
* **xss** – XSS input sanitization
* **moment-timezone** – Timezone handling

### Development Dependencies

* **typescript** – Static type system
* **ts-node** – Run TypeScript directly
* **nodemon** – Auto-reload during development
* **@types/*** – Type definitions for TypeScript

## 📁 Recommended Project Structure

```bash
src/
├── app.ts              # Express app configuration
├── server.ts           # Application bootstrap
├── config/             # Environment, DB, Redis, Queue config
├── routes/             # Route definitions
├── controllers/        # HTTP request handlers
├── services/           # Business logic layer
├── models/             # Mongoose models
├── middlewares/        # Auth, error handler, rate limiter
├── jobs/               # BullMQ queues & workers
├── utils/              # Helper functions
├── types/              # Global TypeScript types
└── constants/          # Constants & enums
```

## ⚙️ Environment Variables

Create a `.env` file:

```env
APP_NAME=express-ts-api
APP_ENV=development
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/express_ts

# JWT
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=1d

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 🚀 Installation & Running the Project

### Install dependencies

```bash
npm install
```

### Development mode

```bash
npm run dev
```

### Production build

```bash
npm run build
npm run start
```

## 🔐 Enabled Security Middleware

This template enables the following by default:

* `helmet()` – Secure HTTP headers
* `hpp()` – Prevent HTTP parameter pollution
* `xss()` – Input sanitization
* `express-rate-limit` – Brute-force protection
* `cors()` – CORS handling
* `compression()` – Response compression

## 📬 Queue (BullMQ)

Queue example:

```ts
import { Queue } from "bullmq";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});
```

Worker example:

```ts
import { Worker } from "bullmq";

new Worker("email-queue", async (job) => {
  console.log(job.data);
});
```

## 🧩 Authentication (JWT)

* Login returns an `access_token`
* Token is sent via `Authorization: Bearer <token>`
* Auth middleware can be applied per-route

## 🧪 Best Practices

* Use a **service layer** for business logic
* Avoid accessing models directly in controllers
* Validate request payloads (Zod / Joi recommended)
* Offload heavy tasks to queues

## 📌 Use Cases

* REST APIs
* SaaS backends
* Microservices
* High-traffic APIs

## 📄 License

MIT
