import { MongoClient } from 'mongodb';
import { MONGODB_URL, DB_NAME } from '$env/static/private';

let client = null;
let db = null;

/**
 * Connect to MongoDB and return the database instance
 * Uses singleton pattern to reuse connection
 */
export async function connectToDatabase() {
  if (db) {
    return db;
  }

  if (!MONGODB_URL) {
    throw new Error('MONGODB_URL environment variable is not set');
  }

  if (!DB_NAME) {
    throw new Error('DB_NAME environment variable is not set');
  }

  try {
    client = new MongoClient(MONGODB_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Get the database instance (must be connected first)
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('Disconnected from MongoDB');
  }
}

