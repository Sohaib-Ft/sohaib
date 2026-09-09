const mongoose = require('mongoose');

const connectDB = async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: true,
        dbName: process.env.MONGO_DB_NAME || 'portfolio_db',
      });
      console.log(`[DB] Connected host=${conn.connection.host} db=${conn.connection.name}`);
      console.log(`[DB] projects count in this db: ${await conn.connection.db.collection('projects').countDocuments()}`);
      mongoose.connection.on('error', (e) => console.error('[DB] runtime error:', e.message));
      mongoose.connection.on('disconnected', () => console.error('[DB] disconnected'));
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
  return null;
};

module.exports = connectDB;
