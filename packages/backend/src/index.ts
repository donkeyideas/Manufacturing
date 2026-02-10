import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { errorHandler } from './core/errorHandler.js';
import { requestLogger } from './core/requestLogger.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { financialRouter } from './modules/financial/financial.routes.js';
import { inventoryRouter } from './modules/inventory/inventory.routes.js';
import { salesRouter } from './modules/sales/sales.routes.js';
import { manufacturingRouter } from './modules/manufacturing/manufacturing.routes.js';
import { procurementRouter } from './modules/procurement/procurement.routes.js';
import { demoRouter } from './modules/demo/demo.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { blogRouter } from './modules/blog/blog.routes.js';
import { sopRouter } from './modules/sop/sop.routes.js';
import { portalRouter } from './modules/portal/portal.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxy (Render, Vercel, etc.) for secure cookies & correct IPs
app.set('trust proxy', 1);

// ─── CORS Origins ───
// Supports comma-separated FRONTEND_URL for multiple origins (e.g. frontend + admin)
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// ─── Global Middleware ───
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(requestLogger);

// ─── API Routes ───
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/demo', demoRouter);
app.use('/api/financial', financialRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/sales', salesRouter);
app.use('/api/manufacturing', manufacturingRouter);
app.use('/api/procurement', procurementRouter);
app.use('/api/ai', aiRouter);
app.use('/api/blog', blogRouter);
app.use('/api/sop', sopRouter);
app.use('/api/portal', portalRouter);

// ─── Error Handler (must be last) ───
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ERP API] Server running on port ${PORT}`);
  console.log(`[ERP API] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
