import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion de Bateaux',
      version: '1.0.0',
      description: 'API REST pour la gestion de bateaux avec mise en cache Redis',
      contact: {
        name: 'Digital School of Paris',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        Boat: {
          type: 'object',
          required: ['name', 'type', 'year'],
          properties: {
            id: {
              type: 'string',
              description: 'ID unique du bateau',
            },
            name: {
              type: 'string',
              description: 'Nom du bateau',
            },
            type: {
              type: 'string',
              description: 'Type de bateau',
            },
            year: {
              type: 'integer',
              description: 'Année de fabrication',
            },
            length: {
              type: 'number',
              description: 'Longueur du bateau en mètres',
            },
            capacity: {
              type: 'integer',
              description: 'Capacité en nombre de personnes',
            },
            price: {
              type: 'number',
              description: 'Prix du bateau',
            },
            isAvailable: {
              type: 'boolean',
              description: 'Disponibilité du bateau',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière mise à jour',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup our docs
const swaggerDocs = (app) => {
  // Route for swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('📝 Documentation API disponible à /api-docs');
};

export default swaggerDocs;
