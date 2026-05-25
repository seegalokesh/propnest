const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || './propnest.db';

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);

    console.log('Connected to database at', DB_PATH);

    db.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
    `);
  }

  return db;
}

module.exports = { getDb };