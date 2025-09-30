const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all agents
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT id, name, email, mobile, created_at FROM agents', [], (err, agents) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(agents);
  });
});

// Add new agent
router.post('/', authenticateToken, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, mobile, password } = req.body;

  try {
    // Check if email already exists
    db.get('SELECT id FROM agents WHERE email = ?', [email], async (err, agent) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (agent) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert agent into database
      db.run(
        'INSERT INTO agents (name, email, mobile, password) VALUES (?, ?, ?, ?)',
        [name, email, mobile, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create agent', details: err.message });
          }

          res.status(201).json({
            message: 'Agent created successfully',
            agent: {
              id: this.lastID,
              name,
              email,
              mobile
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router;
