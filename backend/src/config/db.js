import mongoose from 'mongoose';

export async function connectdatabase(uri) {
  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  return mongoose.connection;
}

export async function disconnectdatabase() {
  await mongoose.disconnect();
}
