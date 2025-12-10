import mongoose from 'mongoose';
import config from './index.js';

/**
 * Database Connection Manager
 * Handles MongoDB connection with retry logic and event listeners
 */
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Connect to MongoDB with retry mechanism
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      // Mongoose connection options
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      // Attempt connection
      const connection = await mongoose.connect(config.mongodb.uri, options);
      
      this.isConnected = true;
      this.retryAttempts = 0;
      
      console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
      console.log(`📦 Database: ${connection.connection.name}`);

      // Set up event listeners
      this.setupEventListeners();

    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      await this.handleConnectionError();
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  async handleConnectionError() {
    if (this.retryAttempts < this.maxRetries) {
      this.retryAttempts++;
      console.log(
        `🔄 Retrying connection (${this.retryAttempts}/${this.maxRetries}) in ${this.retryDelay / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
      await this.connect();
    } else {
      console.error('❌ Max retry attempts reached. Exiting...');
      process.exit(1);
    }
  }

  /**
   * Set up MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
      this.isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
      this.isConnected = true;
    });

    mongoose.connection.on('error', (error) => {
      console.error(`❌ MongoDB error: ${error.message}`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      console.log('📴 MongoDB connection closed');
      this.isConnected = false;
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  getConnectionStatus() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
export const db = new DatabaseConnection();
export default db;

