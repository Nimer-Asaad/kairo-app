import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, "../../data");
const DB_FILE = path.join(DB_DIR, "local_db.json");

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize empty database structure
const initDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const emptyDB = {
      users: [],
      emails: [],
      syncStates: [],
      _meta: {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyDB, null, 2));
  }
};

// Load entire database
const loadDB = () => {
  try {
    initDB();
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to load local DB:", err);
    return { users: [], emails: [], syncStates: [], _meta: {} };
  }
};

// Save database
const saveDB = (db) => {
  try {
    db._meta.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to save local DB:", err);
  }
};

// LocalStore class (mimics MongoDB-like operations)
export class LocalStore {
  // User operations
  static createUser(user) {
    const db = loadDB();
    const newUser = {
      _id: `user_${Date.now()}`,
      ...user,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDB(db);
    return newUser;
  }

  static findUserByEmail(email) {
    const db = loadDB();
    return db.users.find((u) => u.email === email) || null;
  }

  static findUserById(id) {
    const db = loadDB();
    return db.users.find((u) => u._id === id) || null;
  }

  static updateUser(id, updates) {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u._id === id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...updates };
      saveDB(db);
      return db.users[idx];
    }
    return null;
  }

  static findAllUsers(query = {}, projection = null) {
    const db = loadDB();
    let filtered = db.users.filter((user) => {
      for (const key in query) {
        if (query[key] === undefined) continue;
        if (user[key] !== query[key]) return false;
      }
      return true;
    });

    // Handle projection (select only specific fields)
    if (projection && typeof projection === 'string') {
      const fields = projection.split(' ');
      filtered = filtered.map((user) => {
        const projected = {};
        fields.forEach((field) => {
          if (user.hasOwnProperty(field)) {
            projected[field] = user[field];
          }
        });
        // Always include _id for consistency with MongoDB
        if (!projected._id) projected._id = user._id;
        return projected;
      });
    }

    return filtered;
  }

  // Email operations
  static createEmail(email) {
    const db = loadDB();
    const newEmail = {
      _id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...email,
      createdAt: new Date().toISOString(),
    };
    db.emails.push(newEmail);
    saveDB(db);
    return newEmail;
  }

  static findEmails(query = {}) {
    const db = loadDB();
    return db.emails.filter((email) => {
      for (const key in query) {
        if (query[key] === undefined) continue;
        
        const queryValue = query[key];
        const emailValue = email[key];
        
        // Handle MongoDB operators
        if (typeof queryValue === 'object' && queryValue !== null && !Array.isArray(queryValue)) {
          // Handle $in operator for arrays (e.g., labels)
          if (queryValue.$in && Array.isArray(queryValue.$in)) {
            if (!Array.isArray(emailValue)) return false;
            // Check if any label in email matches any in query
            const hasMatch = queryValue.$in.some(label => emailValue.includes(label));
            if (!hasMatch) return false;
            continue;
          }
          // Handle $gte, $lte for dates
          if (queryValue.$gte && new Date(emailValue) < new Date(queryValue.$gte)) return false;
          if (queryValue.$lte && new Date(emailValue) > new Date(queryValue.$lte)) return false;
          continue;
        }
        
        // Handle $or operator: any condition can match
        if (key === '$or' && Array.isArray(queryValue)) {
          const orMatch = queryValue.some(condition => {
            // For each $or condition, check if ANY field matches (not all)
            return Object.entries(condition).some(([k, v]) => {
              if (v instanceof RegExp) {
                return v.test(email[k] || '');
              }
              return email[k] === v;
            });
          });
          if (!orMatch) return false;
          continue;
        }
        
        // Handle RegExp
        if (queryValue instanceof RegExp) {
          if (!queryValue.test(emailValue)) return false;
          continue;
        }
        
        // Simple equality check
        if (emailValue !== queryValue) return false;
      }
      return true;
    });
  }

  static findEmailByGmailId(userId, gmailId) {
    const db = loadDB();
    return db.emails.find((e) => e.userId === userId && e.gmailId === gmailId) || null;
  }

  static countEmails(query = {}) {
    return this.findEmails(query).length;
  }

  static saveEmails(emails) {
    const db = loadDB();
    for (const email of emails) {
      const idx = db.emails.findIndex((e) => e._id === email._id);
      if (idx !== -1) {
        db.emails[idx] = { ...db.emails[idx], ...email };
      } else {
        email._id = email._id || `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.emails.push(email);
      }
    }
    saveDB(db);
  }

  // SyncState operations
  static getSyncState(userId, scope = "inbox") {
    const db = loadDB();
    return (
      db.syncStates.find((s) => s.userId === userId && s.scope === scope) || null
    );
  }

  static updateSyncState(userId, scope, updates) {
    const db = loadDB();
    let state = db.syncStates.find((s) => s.userId === userId && s.scope === scope);
    if (!state) {
      state = {
        userId,
        scope,
        lastPageToken: null,
        totalSynced: 0,
        totalSkipped: 0,
        pagesProcessed: 0,
        createdAt: new Date().toISOString(),
      };
      db.syncStates.push(state);
    }
    Object.assign(state, updates);
    state.updatedAt = new Date().toISOString();
    saveDB(db);
    return state;
  }

  static resetSyncState(userId, scope = "inbox") {
    const db = loadDB();
    const idx = db.syncStates.findIndex((s) => s.userId === userId && s.scope === scope);
    if (idx !== -1) {
      db.syncStates[idx] = {
        userId,
        scope,
        lastPageToken: null,
        totalSynced: 0,
        totalSkipped: 0,
        pagesProcessed: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveDB(db);
      return db.syncStates[idx];
    }
    return null;
  }

  // Utility: get DB info
  static getDbInfo() {
    const db = loadDB();
    return {
      users: db.users.length,
      emails: db.emails.length,
      syncStates: db.syncStates.length,
      filePath: DB_FILE,
      lastUpdated: db._meta?.lastUpdated,
    };
  }
}

export default LocalStore;
