import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, 
}));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Mount auth/leads routes later when requested
// e.g. app.use('/auth', authRoutes);
//      app.use('/leads', leadRoutes);


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
