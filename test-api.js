import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';

// Helper function to make API requests
const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      data
    };
  },

  post: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      data
    };
  },

  put: async (endpoint, body) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      data
    };
  },

  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE'
    });
    const contentType = response.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      status: response.status,
      data
    };
  }
};

const testBoat = {
  name: 'Test Boat',
  type: 'Sailboat',
  year: 2022,
  length: 12.5,
  capacity: 8,
  price: 180000,
  isAvailable: true
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const logResult = (test, success, data) => {
  if (success) {
    console.log(`${colors.green}✓ ${test}${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${test}${colors.reset}`);
    console.log(`${colors.yellow}Error:${colors.reset}`, data);
  }
};

async function runTests() {
  console.log(`${colors.cyan}Starting API Tests...${colors.reset}`);
  let testBoatId;

  try {
    console.log(`\n${colors.blue}Testing API Health...${colors.reset}`);
    const healthResponse = await api.get('/');
    logResult('API Health Check',
      healthResponse.status === 200 && typeof healthResponse.data === 'object' && healthResponse.data.status === 'ok',
      healthResponse.data);

    console.log(`\n${colors.blue}Testing Redis Connection...${colors.reset}`);
    const redisResponse = await api.get('/redis/health');
    logResult('Redis Health Check',
      redisResponse.status === 200 && typeof redisResponse.data === 'object' && redisResponse.data.status === 'ok',
      redisResponse.data);

    console.log(`\n${colors.blue}Testing Boat CRUD Operations...${colors.reset}`);
    console.log(`${colors.yellow}Creating boat...${colors.reset}`);
    const createResponse = await api.post('/boats', testBoat);
    const createSuccess = createResponse.status === 201 && createResponse.data.id;
    logResult('Create Boat', createSuccess, createResponse.data);

    if (createSuccess) {
      testBoatId = createResponse.data.id;
      console.log(`Created boat with ID: ${testBoatId}`);

      console.log(`\n${colors.yellow}Getting boat...${colors.reset}`);
      const getResponse = await api.get(`/boats/${testBoatId}`);
      logResult('Get Boat',
        getResponse.status === 200 && getResponse.data.id === testBoatId,
        getResponse.data);

      console.log(`\n${colors.yellow}Updating boat...${colors.reset}`);
      const updateData = { name: 'Updated Test Boat', price: 195000 };
      const updateResponse = await api.put(`/boats/${testBoatId}`, updateData);
      logResult('Update Boat',
        updateResponse.status === 200 &&
        updateResponse.data.name === updateData.name &&
        updateResponse.data.price === updateData.price,
        updateResponse.data);

      console.log(`\n${colors.yellow}Getting all boats...${colors.reset}`);
      const getAllResponse = await api.get('/boats');
      logResult('Get All Boats',
        getAllResponse.status === 200 && Array.isArray(getAllResponse.data),
        getAllResponse.data);

      console.log(`\n${colors.yellow}Deleting boat...${colors.reset}`);
      const deleteResponse = await api.delete(`/boats/${testBoatId}`);
      logResult('Delete Boat',
        deleteResponse.status === 200,
        deleteResponse.data);

      console.log(`\n${colors.yellow}Verifying deletion...${colors.reset}`);
      const verifyDeleteResponse = await api.get(`/boats/${testBoatId}`);
      logResult('Verify Deletion',
        verifyDeleteResponse.status === 404,
        verifyDeleteResponse.data);
    }

    console.log(`\n${colors.blue}Testing Redis Caching...${colors.reset}`);
    console.log(`${colors.yellow}Clearing cache...${colors.reset}`);
    const clearCacheResponse = await api.post('/redis/clear-cache', {});
    logResult('Clear Cache',
      clearCacheResponse.status === 200,
      clearCacheResponse.data);

    console.log(`\n${colors.yellow}Getting Redis stats...${colors.reset}`);
    const statsResponse = await api.get('/redis/stats');
    logResult('Redis Stats',
      statsResponse.status === 200,
      statsResponse.data);

    console.log(`\n${colors.green}All tests completed!${colors.reset}`);

  } catch (error) {
    console.log(`${colors.red}Test failed with error:${colors.reset}`, error);
  }
}

runTests();