import { connectToDatabase } from '../mongodb.js';
import bcrypt from 'bcryptjs';

const COLLECTION_NAME = 'users';

/**
 * User model for MongoDB
 */
export class User {
  /**
   * Create a new user
   * @param {Object} userData - User data (name, email, password, username)
   * @returns {Promise<Object>} Created user (without password)
   */
  static async create(userData) {
    const { name, email, password, username } = userData;

    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }

    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username?.toLowerCase() }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userDoc = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username?.toLowerCase() || email.toLowerCase().split('@')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await users.insertOne(userDoc);

    // Return user without password
    const { password: _, ...user } = userDoc;
    return {
      ...user,
      _id: result.insertedId
    };
  }

  /**
   * Find user by email
   * @param {string} email
   * @returns {Promise<Object|null>} User document or null
   */
  static async findByEmail(email) {
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);
    return await users.findOne({ email: email.toLowerCase() });
  }

  /**
   * Find user by username
   * @param {string} username
   * @returns {Promise<Object|null>} User document or null
   */
  static async findByUsername(username) {
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);
    return await users.findOne({ username: username.toLowerCase() });
  }

  /**
   * Find user by ID
   * @param {string} userId
   * @returns {Promise<Object|null>} User document or null
   */
  static async findById(userId) {
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);
    const { ObjectId } = await import('mongodb');
    return await users.findOne({ _id: new ObjectId(userId) });
  }

  /**
   * Verify password
   * @param {string} plainPassword
   * @param {string} hashedPassword
   * @returns {Promise<boolean>}
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Authenticate user (login)
   * @param {string} identifier - Email or username
   * @param {string} password
   * @returns {Promise<Object|null>} User document (without password) or null
   */
  static async authenticate(identifier, password) {
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);

    // Try to find by email or username
    const user = await users.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return null;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

