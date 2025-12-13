import mongoose from "mongoose";
import LocalStore from "./localStore.js";
import User from "../models/User.js";
import Email from "../models/Email.js";
import SyncState from "../models/SyncState.js";

let useLocal = false;

/**
 * Initialize database connection
 * Falls back to local JSON storage if MongoDB fails
 */
export const initDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/kairo-app";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Ensure correct indexes for SyncState: unique on (userId, scope). Drop any legacy unique index on userId only.
    try {
      // Build schema-declared indexes
      await SyncState.syncIndexes();
      const indexes = await SyncState.collection.indexes();
      // Detect any legacy unique index defined only on userId
      const legacyUserIdUniques = indexes.filter(
        (ix) => ix.unique && ix.key && Object.keys(ix.key).length === 1 && ix.key.userId === 1
      );
      if (legacyUserIdUniques.length) {
        console.warn(
          `⚠️ Found ${legacyUserIdUniques.length} legacy unique index(es) on SyncState.userId. Dropping to prevent E11000...`
        );
        for (const ix of legacyUserIdUniques) {
          try {
            await SyncState.collection.dropIndex(ix.name);
            console.log(`🗑️ Dropped index ${ix.name}`);
          } catch (dropErr) {
            console.warn(`Failed dropping index ${ix.name}:`, dropErr?.message || dropErr);
          }
        }
        // Recreate correct indexes
        try {
          await SyncState.collection.createIndex({ userId: 1 }, { unique: false });
          await SyncState.collection.createIndex({ userId: 1, scope: 1 }, { unique: true });
          console.log("✅ Ensured indexes: non-unique userId, unique (userId, scope)");
        } catch (reIxErr) {
          console.warn("Failed recreating indexes:", reIxErr?.message || reIxErr);
        }
      }
    } catch (idxErr) {
      console.warn("Index check/update for SyncState failed:", idxErr?.message || idxErr);
    }
    useLocal = false;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.warn(
      "⚠️ MongoDB connection failed. Falling back to local JSON storage:",
      err.message
    );
    useLocal = true;
    console.log("📁 Using local JSON file for data storage at data/local_db.json");
  }
};

/**
 * Generic DB operations that work with both MongoDB and local storage
 */
export const dbManager = {
  // User operations
  async createUser(userData) {
    if (useLocal) {
      return LocalStore.createUser(userData);
    }
    return User.create(userData);
  },

  async findUserByEmail(email) {
    if (useLocal) {
      return LocalStore.findUserByEmail(email);
    }
    return User.findOne({ email });
  },

  async findUserById(id) {
    if (useLocal) {
      return LocalStore.findUserById(id);
    }
    return User.findById(id);
  },

  async updateUser(id, updates) {
    if (useLocal) {
      return LocalStore.updateUser(id, updates);
    }
    return User.findByIdAndUpdate(id, updates, { new: true });
  },

  async findAllUsers(query = {}, projection = null) {
    if (useLocal) {
      return LocalStore.findAllUsers(query, projection);
    }
    return User.find(query, projection);
  },

  // Email operations
  async createEmail(emailData) {
    if (useLocal) {
      return LocalStore.createEmail(emailData);
    }
    return Email.create(emailData);
  },

  async findEmails(query) {
    if (useLocal) {
      return LocalStore.findEmails(query);
    }
    return Email.find(query);
  },

  async findEmailByGmailId(userId, gmailId) {
    if (useLocal) {
      return LocalStore.findEmailByGmailId(userId, gmailId);
    }
    return Email.findOne({ userId, gmailId });
  },

  async countEmails(query) {
    if (useLocal) {
      return LocalStore.countEmails(query);
    }
    return Email.countDocuments(query);
  },

  async saveEmails(emails) {
    if (useLocal) {
      return LocalStore.saveEmails(emails);
    }
    // For MongoDB, use insertMany with upsert pattern
    for (const email of emails) {
      await Email.findByIdAndUpdate(email._id, email, { upsert: true });
    }
  },

  // SyncState operations
  async getSyncState(userId, scope = "inbox") {
    if (useLocal) {
      return LocalStore.getSyncState(userId, scope);
    }
    return SyncState.findOne({ userId, scope });
  },

  async updateSyncState(userId, scope, updates) {
    if (useLocal) {
      return LocalStore.updateSyncState(userId, scope, updates);
    }
    return SyncState.findOneAndUpdate(
      { userId, scope },
      updates,
      { upsert: true, new: true }
    );
  },

  async resetSyncState(userId, scope = "inbox") {
    if (useLocal) {
      return LocalStore.resetSyncState(userId, scope);
    }
    return SyncState.findOneAndUpdate(
      { userId, scope },
      { lastPageToken: null, totalSynced: 0, totalSkipped: 0, pagesProcessed: 0 },
      { upsert: true, new: true }
    );
  },

  // Info
  getDbInfo() {
    if (useLocal) {
      return LocalStore.getDbInfo();
    }
    return { mode: "mongodb", connected: mongoose.connection.readyState === 1 };
  },

  isUsingLocal() {
    return useLocal;
  },
};

export default dbManager;
