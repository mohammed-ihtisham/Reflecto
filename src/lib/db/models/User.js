import { connectToDatabase } from "../mongodb.js";
import bcrypt from "bcryptjs";

const COLLECTION_NAME = "users";

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
      throw new Error("Name, email, and password are required");
    }

    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username?.toLowerCase() },
      ],
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user document
    const userDoc = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username?.toLowerCase() || email.toLowerCase().split("@")[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(userDoc);

    if (!result.insertedId) {
      throw new Error("Failed to insert user into database");
    }

    console.log("User created with _id:", result.insertedId.toString());

    // Return user without password
    const { password: _, ...user } = userDoc;
    return {
      ...user,
      _id: result.insertedId,
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
    if (!userId) {
      console.log("findById called with null/undefined userId");
      return null;
    }
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);
    const { ObjectId } = await import("mongodb");

    try {
      // Handle both string and ObjectId formats
      const objectId =
        userId instanceof ObjectId ? userId : new ObjectId(userId);

      console.log(
        "findById - Searching for user with ObjectId:",
        objectId.toString()
      );

      const user = await users.findOne({ _id: objectId });

      if (!user) {
        // Try to find by string match as fallback
        console.log(
          "User not found with ObjectId, trying alternative queries..."
        );
        const allUsers = await users.find({}).limit(5).toArray();
        console.log(
          "Sample users in database:",
          allUsers.map((u) => ({ _id: u._id.toString(), email: u.email }))
        );
      } else {
        console.log("User found:", {
          _id: user._id.toString(),
          email: user.email,
        });
      }

      return user;
    } catch (error) {
      console.error(
        "Error finding user by ID:",
        error.message,
        "userId:",
        userId,
        "userId type:",
        typeof userId
      );
      return null;
    }
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
        { username: identifier.toLowerCase() },
      ],
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

  /**
   * Update user's depiction description
   * @param {string} userId - User ID
   * @param {string} depictionDescription - Description of how the user wants to look
   * @returns {Promise<Object|null>} Updated user document (without password) or null
   */
  static async updateDepictionDescription(userId, depictionDescription) {
    if (!userId) {
      console.log("updateDepictionDescription - userId is null/undefined");
      return null;
    }
    const db = await connectToDatabase();
    const users = db.collection(COLLECTION_NAME);
    const { ObjectId } = await import("mongodb");

    try {
      // Handle both string and ObjectId formats
      const objectId =
        userId instanceof ObjectId ? userId : new ObjectId(userId);

      console.log(
        "updateDepictionDescription - Updating user with ObjectId:",
        objectId.toString()
      );

      // Use updateOne + findOne instead of findOneAndUpdate for more reliable behavior
      const updateResult = await users.updateOne(
        { _id: objectId },
        {
          $set: {
            depictionDescription: depictionDescription?.trim() || "",
            updatedAt: new Date(),
          },
        }
      );

      console.log("updateDepictionDescription - updateOne result:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        acknowledged: updateResult.acknowledged,
      });

      if (updateResult.matchedCount === 0) {
        console.error("updateDepictionDescription - No user matched the query");
        return null;
      }

      // Fetch the updated user
      const updatedUser = await users.findOne({ _id: objectId });

      if (!updatedUser) {
        console.error(
          "updateDepictionDescription - User not found after update"
        );
        return null;
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = updatedUser;
      console.log("updateDepictionDescription - Successfully updated user:", {
        _id: userWithoutPassword._id.toString(),
        email: userWithoutPassword.email,
      });
      return userWithoutPassword;
    } catch (error) {
      console.error(
        "Error updating depiction description:",
        error.message,
        "userId:",
        userId
      );
      return null;
    }
  }
}
