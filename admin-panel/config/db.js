const mongoose = require('mongoose');

const connectDB = async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: true,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`[DB] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt >= 10) {
        console.error('[DB] Giving up after 10 attempts. API will run without database.');
        break;
      }
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  mongoose.connection.on('error', (e) => console.error('[DB] runtime error:', e.message));
  mongoose.connection.on('disconnected', () => console.error('[DB] disconnected'));
  return null;
};

module.exports = connectDB;
