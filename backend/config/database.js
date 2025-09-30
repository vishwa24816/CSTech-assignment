const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Create users table (admin users)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      // Create default admin user if not exists
      createDefaultAdmin();
    }
  });

  // Create agents table
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating agents table:', err.message);
    }
  });

  // Create lists table (distributed items)
  db.run(`
    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating lists table:', err.message);
    }
  });
}

// Create default admin user
function createDefaultAdmin() {
  const defaultEmail = 'admin@example.com';
  const defaultPassword = 'admin@123';

  db.get('SELECT id FROM users WHERE email = ?', [defaultEmail], async (err, row) => {
    if (err) {
      console.error('Error checking for admin user:', err.message);
    } else if (!row) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', [defaultEmail, hashedPassword], (err) => {
        if (err) {
          console.error('Error creating default admin:', err.message);
        } else {
          console.log('Default admin created: admin@example.com / admin@123');
        }
      });
    }
  });
}

module.exports = db;
