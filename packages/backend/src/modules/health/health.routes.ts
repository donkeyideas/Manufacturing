import { Router } from 'express';
import { checkConnection } from '../../database/connection.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbHealthy = await checkConnection();

  const status = dbHealthy ? 'healthy' : 'degraded';
  const httpStatus = dbHealthy ? 200 : 503;

  res.status(httpStatus).json({
    status,
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    uptime: process.uptime(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
    },
  });
});
