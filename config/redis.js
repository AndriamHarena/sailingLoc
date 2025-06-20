import { createClient } from 'redis';

// Use environment variable for Redis URL with fallback to localhost
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// For development without Redis, set to true to use a mock Redis client
// Force using mock Redis since we're having connection issues
const useMockRedis = true;

// Create a mock Redis client for development without Redis
class MockRedisClient {
  constructor() {
    this.store = new Map();
    this.isReady = true;
    console.log('Using Mock Redis Client for development');
  }

  async connect() {
    console.log('Mock Redis Client Connected');
    return this;
  }

  async get(key) {
    console.log(`[MockRedis] GET ${key}`);
    return this.store.get(key);
  }

  async set(key, value, options = {}) {
    console.log(`[MockRedis] SET ${key}`);
    this.store.set(key, value);
    
    // Handle expiration if EX is provided
    if (options.EX) {
      setTimeout(() => {
        this.store.delete(key);
        console.log(`[MockRedis] Expired key: ${key}`);
      }, options.EX * 1000);
    }
    
    return 'OK';
  }

  async del(key) {
    console.log(`[MockRedis] DEL ${key}`);
    if (Array.isArray(key)) {
      key.forEach(k => this.store.delete(k));
      return key.length;
    }
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async keys(pattern) {
    console.log(`[MockRedis] KEYS ${pattern}`);
    if (pattern === '*') {
      return Array.from(this.store.keys());
    }
    
    // Simple pattern matching for keys:* pattern
    const prefix = pattern.replace('*', '');
    return Array.from(this.store.keys()).filter(key => key.startsWith(prefix));
  }

  async incr(key) {
    console.log(`[MockRedis] INCR ${key}`);
    const value = this.store.get(key);
    const newValue = value ? parseInt(value) + 1 : 1;
    this.store.set(key, newValue.toString());
    return newValue;
  }

  async expire(key, seconds) {
    console.log(`[MockRedis] EXPIRE ${key} ${seconds}`);
    if (this.store.has(key)) {
      setTimeout(() => {
        this.store.delete(key);
        console.log(`[MockRedis] Expired key: ${key}`);
      }, seconds * 1000);
      return 1;
    }
    return 0;
  }

  async flushAll() {
    console.log('[MockRedis] FLUSHALL');
    this.store.clear();
    return 'OK';
  }

  async ping() {
    return 'PONG';
  }

  async info() {
    return '# Server\r\nredis_version:mock\r\nredis_mode:standalone\r\n# Memory\r\nused_memory_human:0B\r\n';
  }
}

let redisClient;

if (useMockRedis) {
  redisClient = new MockRedisClient();
  await redisClient.connect();
} else {
  console.log(`Connecting to Redis at ${redisUrl}`);
  
  redisClient = createClient({
    url: redisUrl
  });

  redisClient.on('connect', () => console.log('Redis Client Connected'));
  redisClient.on('ready', () => console.log('Redis Client Ready'));
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('end', () => {
    console.log('Redis Client Connection Ended - Attempting to reconnect...');
    // Attempt to reconnect after a delay
    setTimeout(() => {
      redisClient.connect().catch(err => console.error('Redis Reconnect Error:', err));
    }, 5000);
  });

  // Connect to Redis
  await redisClient.connect().catch(err => console.error('Redis Initial Connection Error:', err));
}

export default redisClient;
