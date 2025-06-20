# SailingLoc - Boat Management API

SailingLoc is a Node.js/Express application for managing a fleet of boats, featuring MongoDB database storage with Prisma ORM and Redis caching for improved performance.

## Architecture

The application follows a modular MVC-inspired architecture:

```
sailingLoc/
├── config/             # Configuration files
│   ├── prisma.js       # Prisma client configuration
│   └── redis.js        # Redis client configuration with fallback mock
├── controllers/        # Business logic
│   ├── boatController.js    # Boat CRUD operations
│   └── redisController.js   # Redis management endpoints
├── middleware/         # Express middleware
│   ├── rateLimit.js    # Rate limiting middleware
│   └── validation.js   # Data validation middleware
├── routes/             # API routes
│   ├── boatRoutes.js   # Boat endpoints
│   └── redisRoutes.js  # Redis management endpoints
├── utils/              # Utility functions
│   ├── logger.js       # Logging utility
│   └── swagger.js      # API documentation setup
├── tests/              # Test files
│   └── api.test.js     # API integration tests
├── index.js            # Application entry point
└── package.json        # Project dependencies
```

## Features

- **CRUD Operations**: Create, read, update, and delete boat records
- **Redis Caching**: Improve performance with Redis-based caching
- **Data Validation**: Validate incoming data with custom middleware
- **Rate Limiting**: Protect API from abuse with Redis-based rate limiting
- **API Documentation**: Swagger/OpenAPI documentation
- **Mock Redis Client**: Development mode with in-memory mock Redis
- **Logging**: Structured logging with different levels
- **Error Handling**: Centralized error handling middleware
- **Testing**: Jest-based API tests

## Redis Caching Strategy

- GET requests are cached with a 5-minute TTL
- Dynamic cache keys based on query parameters
- Cache invalidation on data modification (POST, PUT, DELETE)
- Redis management endpoints for monitoring and maintenance

## API Endpoints

### Boat Endpoints

- `GET /boats` - Get all boats (supports filtering)
- `GET /boats/:id` - Get a specific boat
- `POST /boats` - Create a new boat
- `PUT /boats/:id` - Update a boat
- `DELETE /boats/:id` - Delete a boat

### Redis Management Endpoints

- `GET /redis/health` - Check Redis health
- `GET /redis/stats` - Get Redis statistics
- `POST /redis/clear-cache` - Clear Redis cache

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Redis (optional, falls back to mock Redis)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   DATABASE_URL="mongodb://username:password@localhost:27017/sailingLoc"
   REDIS_URL="redis://localhost:6379"
   ```
4. Start the application:
   ```
   npm run dev
   ```

### Development

The application includes a mock Redis client for development without a Redis server. This is enabled by default in the `config/redis.js` file.

### Testing

Run the tests with:
```
npm test
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.
