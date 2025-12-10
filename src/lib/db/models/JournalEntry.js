import { connectToDatabase } from "../mongodb.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "journal_entries";

/**
 * JournalEntry model for MongoDB
 */
export class JournalEntry {
  /**
   * Create or update a journal entry for a user and date
   * @param {string} userId - User ID
   * @param {Date} date - Date of the entry
   * @param {string} content - Journal entry content
   * @param {Array} chatMessages - Chat conversation history
   * @param {Array} comicImageUrls - Array of GCS URLs for comic images
   * @param {Object} metadata - Optional metadata (mood, etc.)
   * @returns {Promise<Object>} Created/updated journal entry
   */
  static async upsert(
    userId,
    date,
    content,
    chatMessages = undefined,
    comicImageUrls = undefined,
    metadata = {}
  ) {
    const db = await connectToDatabase();
    const entries = db.collection(COLLECTION_NAME);

    // Convert userId to ObjectId if it's a string
    const userIdObj =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    // Normalize date to start of day (UTC)
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const sanitizedContent = (content || "").trim();

    // Build update parts conditionally so we don't wipe chat/comics when omitted
    const setFields = {
      content: sanitizedContent,
      ...metadata,
      updatedAt: new Date(),
    };

    if (Array.isArray(chatMessages)) {
      setFields.chatMessages = chatMessages;
    }

    if (Array.isArray(comicImageUrls)) {
      setFields.comicImageUrls = comicImageUrls;
    }

    const entryDoc = {
      userId: userIdObj,
      date: entryDate,
      ...setFields,
      createdAt: new Date(), // Will be set on insert, preserved on update
    };

    const result = await entries.findOneAndUpdate(
      {
        userId: userIdObj,
        date: entryDate,
      },
      {
        $set: setFields,
        $setOnInsert: {
          userId: userIdObj,
          date: entryDate,
          createdAt: entryDoc.createdAt,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    // Mongo driver can return null in some environments when an upsert creates
    // a new document. Fallback to fetching the document explicitly so callers
    // always receive the saved entry.
    if (result.value) {
      return result.value;
    }

    return await entries.findOne({
      userId: userIdObj,
      date: entryDate,
    });
  }

  /**
   * Get journal entry for a specific user and date
   * @param {string} userId - User ID
   * @param {Date} date - Date of the entry
   * @returns {Promise<Object|null>} Journal entry or null
   */
  static async findByDate(userId, date) {
    const db = await connectToDatabase();
    const entries = db.collection(COLLECTION_NAME);

    // Convert userId to ObjectId if it's a string
    const userIdObj =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    // Normalize date to start of day (UTC)
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    return await entries.findOne({
      userId: userIdObj,
      date: entryDate,
    });
  }

  /**
   * Get all journal entries for a user within a date range
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date (inclusive)
   * @param {Date} endDate - End date (inclusive)
   * @returns {Promise<Array>} Array of journal entries
   */
  static async findByDateRange(userId, startDate, endDate) {
    const db = await connectToDatabase();
    const entries = db.collection(COLLECTION_NAME);

    // Convert userId to ObjectId if it's a string
    const userIdObj =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    // Normalize dates to start of day (UTC)
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return await entries
      .find({
        userId: userIdObj,
        date: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ date: -1 })
      .toArray();
  }

  /**
   * Get all journal entries for a user
   * @param {string} userId - User ID
   * @param {number} limit - Optional limit
   * @returns {Promise<Array>} Array of journal entries
   */
  static async findByUser(userId, limit = null) {
    const db = await connectToDatabase();
    const entries = db.collection(COLLECTION_NAME);

    // Convert userId to ObjectId if it's a string
    const userIdObj =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    let query = entries.find({ userId: userIdObj }).sort({ date: -1 });

    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  /**
   * Delete a journal entry
   * @param {string} userId - User ID
   * @param {Date} date - Date of the entry
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  static async delete(userId, date) {
    const db = await connectToDatabase();
    const entries = db.collection(COLLECTION_NAME);

    // Convert userId to ObjectId if it's a string
    const userIdObj =
      typeof userId === "string" ? new ObjectId(userId) : userId;

    // Normalize date to start of day (UTC)
    const entryDate = new Date(date);
    entryDate.setHours(0, 0, 0, 0);

    const result = await entries.deleteOne({
      userId: userIdObj,
      date: entryDate,
    });

    return result.deletedCount > 0;
  }
}
