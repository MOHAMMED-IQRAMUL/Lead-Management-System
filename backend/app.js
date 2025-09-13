import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import userRoutes from './src/routes/User.routes.js';
import leadRoutes from './src/routes/Lead.routes.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '15kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// In development, allow any origin (helps when Vite picks a different port). In production, restrict to FRONTEND_URL.
const corsOrigin = process.env.NODE_ENV === 'production' ? FRONTEND_URL : true;
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/auth', userRoutes); 
app.use('/leads', leadRoutes); 

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
});

export default app;
