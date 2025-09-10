import mongoose from 'mongoose';
import debugLib from 'debug';

const debug = debugLib('app:db');

const defaultOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
};

export async function connectDB(mongoUri = process.env.MONGO_URI) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set in environment variables.');
  }

  try {
    mongoose.set('strictQuery', true); 
    await mongoose.connect(mongoUri, defaultOptions);
    debug('MongoDB connected');
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('✅ MongoDB connected:', mongoose.connection.host, mongoose.connection.name);
    }

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    return mongoose.connection;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('✖ MongoDB connection error:', err.message);
    throw err;
  }
}
