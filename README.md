# Access Key & Authentication Microservice

## Introduction
This microservice handles user authentication, authorization, and management of API access keys. It provides endpoints for user signup, login (JWT issuance), and CRUD operations on access keys, including generating, updating (rate limits, expiration, usage tracking), disabling, and deleting keys. All key changes are broadcast via Redis Pub/Sub for synchronization across distributed services.

## Features
- Admin User registration and login with JWT authentication 
- Role-based access control (admin-only endpoints)
- Secure password hashing with bcrypt
- Access key generation with Base64-encoded UUID + randomness
- Key attributes: rateLimit, expiration, currentUsage, threshold
- Pub/Sub via Redis for key synchronization
- Global exception handling and structured logging (Winston)

## Prerequisites
- Node.js v16+
- npm or yarn
- PostgreSQL database
- Redis server

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url> && cd access-key-auth-service
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Environment Variables
Create a `.env` file at the root with:
```
# Database
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE

# JWT
JWT_SECRET=your_jwt_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```  

## Running the Service
```bash
npm run start:dev
```  
The service will run on `http://localhost:3000` by default.

## API Endpoints
### Auth
- `POST /auth/signup` - Register new user
- `POST /auth/login`  - Login and receive JWT

### Access Key (admin only)
All routes require `Authorization: Bearer <JWT>` header.
- `POST /access-key/generate`  - Create new access key
- `GET /access-key`            - List all keys
- `GET /access-key/:key`       - Get key details
- `PATCH /access-key/:id`      - Update key attributes
- `POST /access-key/disable/:key`  - Disable key
- `DELETE /access-key/:id`     - Delete key

## Testing
```bash
npm run test
npm run test:watch
```  

---
# Token Info Microservice

## Introduction
This microservice provides price lookup for cryptocurrency tokens via the CoinGecko API. It enforces per-key rate limiting using Redis sorted sets and a circuit breaker (Opossum) for external API resilience.

## Features
- Token price lookup (`/token-info` endpoint)
- API key guard (checks key validity, expiration, usage quota)
- Redis-based rate limiting (60s window)
- Event-driven usage sync via Redis Pub/Sub
- Circuit breaker with fallback for external API failures
- Global exception filter and structured logging

## Prerequisites
- Node.js v22+
- npm or yarn
- Redis server

## Installation
1. Clone the repository:
   ```bash
   git clone <repo-url> && cd token-info-service
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Environment Variables
Create a `.env` file:
```
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Access Key Service URL
ACCESS_KEY_SERVICE_URL=http://localhost:3000
```  

## Running the Service
```bash
npm run start:dev
```  
Default port: `3001`.

## API Endpoints
- `POST /token-info`  
  - Headers: `x-api-key: <access_key>`
  - Body: `{ "tokenId": "bitcoin" }`
  - Response: `{ "usd": 58000.12 }`

## Testing
```bash
npm run test
npm run test:watch
```

