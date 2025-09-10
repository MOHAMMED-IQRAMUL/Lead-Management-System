import 'dotenv/config'; 
import app from './app.js';
import { connectDB } from './src/config/database.config.js';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await connectDB(process.env.MONGO_URI);
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Server running on port ${PORT} - NODE_ENV=${process.env.NODE_ENV}`);
    });

    process.on('unhandledRejection', (err) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      // eslint-disable-next-line no-console
      console.error('Uncaught Exception:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();