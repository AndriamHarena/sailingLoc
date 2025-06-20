import redisClient from '../config/redis.js';

// Rate limiting middleware using Redis
const rateLimit = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `ratelimit:${ip}`;
  
  try {
    const requests = await redisClient.incr(key);
    
    // First request in the window
    if (requests === 1) {
      await redisClient.expire(key, 60); // 1 minute window
    }
    
    // Set headers to show rate limit info
    res.setHeader('X-RateLimit-Limit', 100);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, 100 - requests));
    
    // Allow up to 100 requests per minute
    if (requests > 100) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return res.status(429).json({ 
        error: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: '60 seconds'
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    next(); // Continue on error
  }
};

export default rateLimit;
