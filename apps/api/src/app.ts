import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Mount versioned REST API
app.use('/api/v1', apiRoutes);

// Root greeting & status
app.get('/', (req, res) => {
  res.json({
    name: 'RevX Core Backend API',
    tagline: 'An AI-Powered Assistant for Smarter, Greener Driving',
    version: '1.4.0',
    documentation: '/api/v1/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Endpoint ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
      statusCode: 404,
    },
  });
});

// Central error handler
app.use(errorHandler);
