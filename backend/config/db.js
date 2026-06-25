const mongoose = require('mongoose');

let cachedConnection = null;
let cachedConnectionPromise = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (cachedConnectionPromise) {
    return cachedConnectionPromise;
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is missing');
  }

  cachedConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    })
    .then((conn) => {
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
    })
    .catch((error) => {
      cachedConnectionPromise = null;
      console.error(`Error: ${error.message}`);
      throw error;
    });

  return cachedConnectionPromise;
};

module.exports = connectDB;
