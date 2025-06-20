import prisma from '../config/prisma.js';
import redisClient from '../config/redis.js';

// Get all boats with optional filtering
export const getAllBoats = async (req, res) => {
  try {
    const { type, minYear, maxYear, minPrice, maxPrice, isAvailable } = req.query;
    
    console.log("Query parameters:", req.query);
    
    const cacheKey = `boats:${JSON.stringify(req.query)}`;
    console.log("Cache key used:", cacheKey);
    
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log("Returning data from Redis cache for key:", cacheKey);
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheError) {
      console.error("Error reading from cache:", cacheError);
      // Continue with database query if cache read fails
    }
    
    console.log("Cache miss, fetching from database");
    
    const filter = {};
    
    if (type) {
      filter.type = type;
      console.log("Adding type filter:", filter.type);
    }
    
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
      console.log("Adding isAvailable filter:", filter.isAvailable);
    }
    
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) {
        filter.year.gte = parseInt(minYear);
        console.log("Adding minYear filter:", filter.year.gte);
      }
      if (maxYear) {
        filter.year.lte = parseInt(maxYear);
        console.log("Adding maxYear filter:", filter.year.lte);
      }
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) {
        filter.price.gte = parseFloat(minPrice);
        console.log("Adding minPrice filter:", filter.price.gte);
      }
      if (maxPrice) {
        filter.price.lte = parseFloat(maxPrice);
        console.log("Adding maxPrice filter:", filter.price.lte);
      }
    }
    
    console.log("Final filter object:", filter);
    
    const boats = await prisma.Boat.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${boats.length} boats`);
    
    try {
      await redisClient.set(cacheKey, JSON.stringify(boats), { EX: 300 });
      console.log("Data stored in Redis with key:", cacheKey);
      
      // Verify the data was stored
      const verifyCache = await redisClient.get(cacheKey);
      console.log("Verification - Data in cache:", verifyCache ? "Yes" : "No");
    } catch (cacheError) {
      console.error("Error writing to cache:", cacheError);
      // Continue even if cache write fails
    }
    
    res.json(boats);
  } catch (error) {
    console.error("Erreur lors de la récupération des bateaux :", error);
    res.status(500).json({ error: "Impossible de récupérer les bateaux" });
  }
};

// Get a single boat by ID
export const getBoatById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cacheKey = `boat:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      console.log(`Returning boat ${id} from Redis cache for key: ${cacheKey}`);
      return res.json(JSON.parse(cachedData));
    }
    
    console.log(`Cache miss for boat ${id}, fetching from database`);
    
    const boat = await prisma.Boat.findUnique({
      where: { id },
    });
    
    if (!boat) {
      return res.status(404).json({ error: "Bateau non trouvé" });
    }
    
    await redisClient.set(cacheKey, JSON.stringify(boat), { EX: 300 });
    
    res.json(boat);
  } catch (error) {
    console.error("Erreur lors de la récupération du bateau :", error);
    res.status(500).json({ error: "Impossible de récupérer le bateau" });
  }
};

// Create a new boat
export const createBoat = async (req, res) => {
  const { name, type, year, length, capacity, price, isAvailable } = req.body;
  try {
    // Validation manuelle (en plus du middleware)
    const errors = [];
    if (!name) errors.push("Le nom du bateau est requis");
    if (!type) errors.push("Le type de bateau est requis");
    if (!year) errors.push("L'année du bateau est requise");
    
    // Si des erreurs sont détectées, renvoyer un code 400
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    const boat = await prisma.Boat.create({
      data: { 
        name, 
        type, 
        year: parseInt(year), 
        length: length ? parseFloat(length) : null,
        capacity: capacity ? parseInt(capacity) : null,
        price: price ? parseFloat(price) : null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });
    
    const keys = await redisClient.keys('boats:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Invalidated boats list cache after creation");
    }
    
    res.status(201).json(boat);
  } catch (error) {
    console.error("Erreur :", error);
    // Vérifier si c'est une erreur de validation Prisma
    if (error.code === 'P2002' || error.name === 'ValidationError') {
      return res.status(400).json({ errors: [error.message] });
    }
    res.status(500).json({ error: "Erreur lors de la création du bateau" });
  }
};

// Update an existing boat
export const updateBoat = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, type, year, length, capacity, price, isAvailable } = req.body;
    
    // Check if boat exists
    const existingBoat = await prisma.Boat.findUnique({
      where: { id },
    });
    
    if (!existingBoat) {
      return res.status(404).json({ error: "Bateau non trouvé" });
    }
    
    // Update boat
    const updatedBoat = await prisma.Boat.update({
      where: { id },
      data: {
        name,
        type,
        year: year ? parseInt(year) : undefined,
        length: length ? parseFloat(length) : null,
        capacity: capacity ? parseInt(capacity) : null,
        price: price ? parseFloat(price) : null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined,
      },
    });
    
    // Invalidate cache
    await redisClient.del(`boat:${id}`);
    
    const listKeys = await redisClient.keys('boats:*');
    if (listKeys.length > 0) {
      await redisClient.del(listKeys);
      console.log("Invalidated boats list cache after update");
    }
    
    res.json(updatedBoat);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du bateau :", error);
    res.status(500).json({ error: "Impossible de mettre à jour le bateau" });
  }
};

// Delete a boat
export const deleteBoat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if boat exists
    const existingBoat = await prisma.Boat.findUnique({
      where: { id },
    });
    
    if (!existingBoat) {
      return res.status(404).json({ error: "Bateau non trouvé" });
    }
    
    // Delete boat
    await prisma.Boat.delete({
      where: { id },
    });
    
    // Invalidate cache
    await redisClient.del(`boat:${id}`);
    
    const listKeys = await redisClient.keys('boats:*');
    if (listKeys.length > 0) {
      await redisClient.del(listKeys);
      console.log("Invalidated boats list cache after deletion");
    }
    
    res.json({ message: "Bateau supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du bateau :", error);
    res.status(500).json({ error: "Impossible de supprimer le bateau" });
  }
};
