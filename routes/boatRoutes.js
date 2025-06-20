import express from 'express';
import { getAllBoats, getBoatById, createBoat, updateBoat, deleteBoat } from '../controllers/boatController.js';
import { validateBoatData, validateBoatQueryParams } from '../middleware/validation.js';

const router = express.Router();

// Boat routes
router.get('/', validateBoatQueryParams, getAllBoats);
router.get('/:id', getBoatById);
router.post('/', validateBoatData, createBoat);
router.put('/:id', validateBoatData, updateBoat);
router.delete('/:id', deleteBoat);

export default router;
