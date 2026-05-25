const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './propnest.db';

let db;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('Connected to database at', DB_PATH);
      }
    });

    db.configure('busyTimeout', 10000);
    
    // Run pragmas
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL');
      db.run('PRAGMA foreign_keys = ON');
    });

    // Add promise-based prepare() method
    db.prepare = function(sql) {
      const dbRef = this;
      return {
        run: function(...params) {
          return new Promise((resolve, reject) => {
            dbRef.run(sql, params, function(err) {
              if (err) reject(err);
              else {
                resolve({ lastInsertRowid: this.lastID, changes: this.changes });
              }
            });
          });
        },
        get: function(...params) {
          return new Promise((resolve, reject) => {
            dbRef.get(sql, params, (err, row) => {
              if (err) reject(err);
              else resolve(row || null);
            });
          });
        },
        all: function(...params) {
          return new Promise((resolve, reject) => {
            dbRef.all(sql, params, (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            });
          });
        }
      };
    };

    // Add async exec for migrations
    db.execAsync = function(sql) {
      return new Promise((resolve, reject) => {
        this.exec(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    };
  }

  return db;
}

module.exports = { getDb };
