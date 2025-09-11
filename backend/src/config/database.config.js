import mongoose from 'mongoose';
import debugLib from 'debug';

const debug = debugLib('erino:db');

const defaultOptions = {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
};

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('MONGO_URI not provided. Set MONGO_URI in environment variables.');
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, defaultOptions);
    debug('MongoDB connected');
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('✅ MongoDB connected to', mongoose.connection.host, mongoose.connection.name);
    }

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });

    return mongoose.connection;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}
