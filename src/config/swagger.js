import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './index.js';

/**
 * Swagger/OpenAPI Documentation Configuration
 * Auto-generates API documentation from JSDoc comments
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Node.js CRUD API',
    version: '1.0.0',
    description: `
      A production-grade RESTful API built with Node.js, Express, and MongoDB.
      
      ## Features
      - JWT Authentication with Access & Refresh Tokens
      - Role-Based Access Control (RBAC)
      - Full CRUD Operations
      - File Upload Support
      - Rate Limiting
      - Input Validation
      
      ## Authentication
      Most endpoints require authentication. Use the \`/auth/login\` endpoint to obtain tokens.
      Include the access token in the Authorization header: \`Bearer <token>\`
    `,
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development server',
    },
    {
      url: 'https://api.example.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'JWT token stored in cookie',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            description: 'User role',
            example: 'user',
          },
          avatar: {
            type: 'string',
            nullable: true,
            description: 'Avatar URL',
            example: '/uploads/avatar-123.jpg',
          },
          isActive: {
            type: 'boolean',
            description: 'Account status',
            example: true,
          },
          isEmailVerified: {
            type: 'boolean',
            description: 'Email verification status',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation date',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update date',
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Must contain uppercase, lowercase, number, and special character',
            example: 'Password@123',
          },
          confirmPassword: {
            type: 'string',
            example: 'Password@123',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
          },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john@example.com',
          },
          password: {
            type: 'string',
            example: 'Password@123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          statusCode: {
            type: 'integer',
            example: 200,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: {
                    type: 'string',
                  },
                  refreshToken: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          statusCode: {
            type: 'integer',
          },
          message: {
            type: 'string',
          },
          data: {
            type: 'object',
          },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          pagination: {
            type: 'object',
            properties: {
              currentPage: {
                type: 'integer',
                example: 1,
              },
              totalPages: {
                type: 'integer',
                example: 10,
              },
              totalItems: {
                type: 'integer',
                example: 100,
              },
              itemsPerPage: {
                type: 'integer',
                example: 10,
              },
              hasNextPage: {
                type: 'boolean',
                example: true,
              },
              hasPrevPage: {
                type: 'boolean',
                example: false,
              },
            },
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              success: false,
              statusCode: 401,
              message: 'Unauthorized',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Not authorized to access this resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              success: false,
              statusCode: 403,
              message: 'Access denied',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              success: false,
              statusCode: 404,
              message: 'Resource not found',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ApiError',
            },
            example: {
              success: false,
              statusCode: 429,
              message: 'Too many requests',
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'API health check endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

// Custom Swagger UI options
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
  `,
  customSiteTitle: 'Node CRUD API - Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
  },
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
export default swaggerSpec;

