import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    
    setTimeout(connectRedis, 5000);
  }
};

redisClient.on('end', () => {
    console.log('Redis connection ended, attempting to reconnect...');
    setTimeout(connectRedis, 5000);
});

connectRedis();

export default redisClient;
