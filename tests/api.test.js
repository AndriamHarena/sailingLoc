import fetch from 'node-fetch';
import { jest } from '@jest/globals';

// Base URL for API
const API_URL = 'http://localhost:3000';

// Helper function to make API requests
const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    return {
      status: response.status,
      data: await response.json()
    };
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return {
      status: response.status,
      data: await response.json()
    };
  },
  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return {
      status: response.status,
      data: await response.json()
    };
  },
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    });
    return {
      status: response.status,
      data: await response.json()
    };
  }
};

// Tests
describe('Boat API', () => {
  let testBoatId;
  
  // Test boat data
  const testBoat = {
    name: 'Test Boat',
    type: 'Sailboat',
    year: 2020,
    length: 10.5,
    capacity: 6,
    price: 150000,
    isAvailable: true
  };
  
  // Test creating a boat
  test('POST /boats - Create a new boat', async () => {
    const response = await api.post('/boats', testBoat);
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data.name).toBe(testBoat.name);
    
    // Save the ID for later tests
    testBoatId = response.data.id;
  });
  
  // Test getting all boats
  test('GET /boats - Get all boats', async () => {
    const response = await api.get('/boats');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });
  
  // Test getting a specific boat
  test('GET /boats/:id - Get a specific boat', async () => {
    const response = await api.get(`/boats/${testBoatId}`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', testBoatId);
    expect(response.data.name).toBe(testBoat.name);
  });
  
  // Test updating a boat
  test('PUT /boats/:id - Update a boat', async () => {
    const updatedData = {
      name: 'Updated Test Boat',
      price: 160000
    };
    
    const response = await api.put(`/boats/${testBoatId}`, updatedData);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', testBoatId);
    expect(response.data.name).toBe(updatedData.name);
    expect(response.data.price).toBe(updatedData.price);
  });
  
  // Test deleting a boat
  test('DELETE /boats/:id - Delete a boat', async () => {
    const response = await api.delete(`/boats/${testBoatId}`);
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });
  
  // Test validation errors
  test('POST /boats - Validation error', async () => {
    const invalidBoat = {
      // Missing required fields
      type: 'Sailboat'
    };
    
    const response = await api.post('/boats', invalidBoat);
    
    expect(response.status).toBe(400);
    expect(response.data).toHaveProperty('errors');
    expect(Array.isArray(response.data.errors)).toBe(true);
  });
});

// Redis API Tests
describe('Redis API', () => {
  // Test Redis health endpoint
  test('GET /redis/health - Check Redis health', async () => {
    const response = await api.get('/redis/health');
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('status', 'ok');
  });
  
  // Test Redis stats endpoint
  test('GET /redis/stats - Get Redis stats', async () => {
    const response = await api.get('/redis/stats');
    
    expect(response.status).toBe(200);
    // Check for some common Redis info sections
    expect(response.data).toHaveProperty('server');
    expect(response.data).toHaveProperty('memory');
  });
  
  // Test Redis cache clearing
  test('POST /redis/clear-cache - Clear Redis cache', async () => {
    const response = await api.post('/redis/clear-cache', {});
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
  });
});

// Cache behavior tests
describe('Caching Behavior', () => {
  let testBoatId;
  
  // Create a test boat first
  beforeAll(async () => {
    const testBoat = {
      name: 'Cache Test Boat',
      type: 'Motorboat',
      year: 2021,
      length: 8.5,
      capacity: 4,
      price: 95000,
      isAvailable: true
    };
    
    const response = await api.post('/boats', testBoat);
    testBoatId = response.data.id;
  });
  
  // Clean up after tests
  afterAll(async () => {
    if (testBoatId) {
      await api.delete(`/boats/${testBoatId}`);
    }
  });
  
  // Test that second request is faster due to caching
  test('Caching improves response time', async () => {
    // Clear cache first
    await api.post('/redis/clear-cache', {});
    
    // First request (cache miss)
    const startFirst = Date.now();
    await api.get('/boats');
    const durationFirst = Date.now() - startFirst;
    
    // Second request (cache hit)
    const startSecond = Date.now();
    await api.get('/boats');
    const durationSecond = Date.now() - startSecond;
    
    // The second request should be faster due to caching
    expect(durationSecond).toBeLessThan(durationFirst);
  });
  
  // Test cache invalidation after update
  test('Cache invalidation after update', async () => {
    // Clear cache first
    await api.post('/redis/clear-cache', {});
    
    // Make initial request to cache
    await api.get(`/boats/${testBoatId}`);
    
    // Update the boat
    const updatedData = {
      name: 'Updated Cache Test Boat',
      price: 100000
    };
    await api.put(`/boats/${testBoatId}`, updatedData);
    
    // Get the boat again
    const response = await api.get(`/boats/${testBoatId}`);
    
    // Should have updated data
    expect(response.data.name).toBe(updatedData.name);
    expect(response.data.price).toBe(updatedData.price);
  });
});
