import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/app';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { initializeUploadDirectory } from './services/fileService';

// Create Express app
export const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Upload-specific rate limiting
const uploadLimiter = rateLimit({
  windowMs: config.uploadRateLimit.windowMs,
  max: config.uploadRateLimit.max,
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Too many upload requests, please try again later.',
    },
  },
});

app.use('/api/candidates/:id/documents', uploadLimiter);

// Swagger/OpenAPI configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATS Candidate Management API',
      version: '1.0.0',
      description: 'REST API for managing candidates in the Applicant Tracking System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Candidate: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'phone'],
          properties: {
            id: { type: 'integer' },
            firstName: { type: 'string', minLength: 2, maxLength: 100 },
            lastName: { type: 'string', minLength: 2, maxLength: 100 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string', maxLength: 500 },
            applicationStatus: { type: 'string' },
            currentStage: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            education: { type: 'array', items: { $ref: '#/components/schemas/Education' } },
            workExperience: { type: 'array', items: { $ref: '#/components/schemas/WorkExperience' } },
            documents: { type: 'array', items: { $ref: '#/components/schemas/Document' } },
          },
        },
        Education: {
          type: 'object',
          required: ['institution', 'degree', 'startDate'],
          properties: {
            id: { type: 'integer' },
            institution: { type: 'string', maxLength: 255 },
            degree: { type: 'string', maxLength: 255 },
            fieldOfStudy: { type: 'string', maxLength: 255 },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date', nullable: true },
            description: { type: 'string', maxLength: 2000 },
          },
        },
        WorkExperience: {
          type: 'object',
          required: ['company', 'position', 'startDate'],
          properties: {
            id: { type: 'integer' },
            company: { type: 'string', maxLength: 255 },
            position: { type: 'string', maxLength: 255 },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date', nullable: true },
            description: { type: 'string', maxLength: 2000 },
            responsibilities: { type: 'string' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            documentType: { type: 'string', enum: ['CV', 'resume', 'cover_letter', 'portfolio', 'certificate', 'other'] },
            fileName: { type: 'string' },
            fileSize: { type: 'string' },
            mimeType: { type: 'string' },
            uploadDate: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ATS Candidate Management API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Initialize upload directory on startup
initializeUploadDirectory().catch((error) => {
  console.error('Failed to initialize upload directory:', error);
  process.exit(1);
});

// Start server
if (require.main === module) {
  const port = config.port;
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
  });
}

export default app;
