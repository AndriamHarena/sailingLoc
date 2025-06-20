import express from "express";
import prisma from "./config/prisma.js";
import redisClient from "./config/redis.js";
import boatRoutes from "./routes/boatRoutes.js";
import redisRoutes from "./routes/redisRoutes.js";
import rateLimit from "./middleware/rateLimit.js";
import swaggerDocs from "./utils/swagger.js";
import logger from "./utils/logger.js";

logger.info("🚀 App démarrée");

const app = express();

app.use(express.json());

// Apply rate limiting to all routes
app.use(rateLimit);

// Setup Swagger documentation
swaggerDocs(app);

// Root route for health check
app.get("/", async (req, res) => {
  try {
    await prisma.$connect();
    const redisStatus = redisClient.isReady ? "Connected" : "Disconnected";
    res.json({ 
      status: "ok", 
      message: "API is running", 
      database: "Connected", 
      redis: redisStatus 
    });
  } catch (error) {
    logger.error("Error connecting to database", error);
    res.status(500).json({ error: "Database connection error" });
  }
});

// Register routes
app.use("/boats", boatRoutes);
app.use("/redis", redisRoutes);

// Log Redis client type
logger.info(`Redis client type: ${redisClient.constructor.name}`);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Une erreur inattendue est survenue',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🌐 Server running on port ${PORT}`);
  logger.info(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
});
