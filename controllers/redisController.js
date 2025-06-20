import redisClient from '../config/redis.js';

// Get Redis stats
export const getRedisStats = async (req, res) => {
  try {
    const info = await redisClient.info();
    
    // Parse Redis INFO output into structured data
    const sections = {};
    let currentSection = 'server';
    
    info.split('\n').forEach(line => {
      // Section headers start with #
      if (line.startsWith('#')) {
        currentSection = line.substring(1).trim().toLowerCase();
        sections[currentSection] = {};
      } 
      // Skip empty lines
      else if (line.trim() !== '') {
        const [key, value] = line.split(':');
        if (key && value) {
          sections[currentSection][key.trim()] = value.trim();
        }
      }
    });
    
    res.json(sections);
  } catch (error) {
    console.error("Erreur lors de la récupération des stats Redis :", error);
    res.status(500).json({ error: "Impossible de récupérer les stats Redis" });
  }
};

// Clear Redis cache
export const clearRedisCache = async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: "Cache Redis vidé avec succès" });
  } catch (error) {
    console.error("Erreur lors du vidage du cache Redis :", error);
    res.status(500).json({ error: "Impossible de vider le cache Redis" });
  }
};

// Check Redis health
export const checkRedisHealth = async (req, res) => {
  try {
    const pong = await redisClient.ping();
    res.json({ 
      status: 'ok',
      ping: pong,
      message: 'Redis est opérationnel'
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'état de Redis :", error);
    res.status(500).json({ 
      status: 'error',
      message: "Redis n'est pas disponible",
      error: error.message
    });
  }
};
