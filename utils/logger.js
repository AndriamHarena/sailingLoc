// Simple logger utility with different log levels
const logger = {
  levels: {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  
  // Default to INFO level
  currentLevel: 2,
  
  // Set the log level
  setLevel(level) {
    if (typeof level === 'string') {
      level = this.levels[level.toUpperCase()] || this.currentLevel;
    }
    this.currentLevel = level;
    return this;
  },
  
  // Format the log message
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        try {
          logMessage += `\n${JSON.stringify(data, null, 2)}`;
        } catch (e) {
          logMessage += `\n[Object cannot be stringified]`;
        }
      } else {
        logMessage += `\n${data}`;
      }
    }
    
    return logMessage;
  },
  
  // Log methods for different levels
  error(message, data) {
    if (this.currentLevel >= this.levels.ERROR) {
      console.error(this.formatMessage('ERROR', message, data));
    }
    return this;
  },
  
  warn(message, data) {
    if (this.currentLevel >= this.levels.WARN) {
      console.warn(this.formatMessage('WARN', message, data));
    }
    return this;
  },
  
  info(message, data) {
    if (this.currentLevel >= this.levels.INFO) {
      console.info(this.formatMessage('INFO', message, data));
    }
    return this;
  },
  
  debug(message, data) {
    if (this.currentLevel >= this.levels.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message, data));
    }
    return this;
  },
  
  // Log cache operations
  cacheHit(key) {
    return this.info(`Cache HIT for key: ${key}`);
  },
  
  cacheMiss(key) {
    return this.info(`Cache MISS for key: ${key}`);
  },
  
  cacheSet(key, ttl) {
    return this.debug(`Cache SET for key: ${key} with TTL: ${ttl}s`);
  },
  
  cacheInvalidate(key) {
    return this.info(`Cache INVALIDATED for key: ${key}`);
  }
};

export default logger;
