const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter to accept only csv, xlsx, xls
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Parse CSV file
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate required fields
        if (data.FirstName && data.Phone) {
          results.push({
            firstName: data.FirstName,
            phone: data.Phone,
            notes: data.Notes || ''
          });
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// Parse Excel file
function parseExcel(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    
    // Map and validate data
    const results = data
      .filter(row => row.FirstName && row.Phone)
      .map(row => ({
        firstName: row.FirstName,
        phone: String(row.Phone),
        notes: row.Notes || ''
      }));
    
    return results;
  } catch (error) {
    throw new Error('Failed to parse Excel file: ' + error.message);
  }
}

// Upload and distribute CSV/Excel file
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let data = [];

    // Parse file based on extension
    if (ext === '.csv') {
      data = await parseCSV(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      data = await parseExcel(filePath);
    }

    if (data.length === 0) {
      fs.unlinkSync(filePath); // Delete uploaded file
      return res.status(400).json({ error: 'No valid data found in file. Ensure columns are named: FirstName, Phone, Notes' });
    }

    // Get all agents
    db.all('SELECT id FROM agents', [], (err, agents) => {
      if (err) {
        fs.unlinkSync(filePath);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (agents.length === 0) {
        fs.unlinkSync(filePath);
        return res.status(400).json({ error: 'No agents available. Please add agents first.' });
      }

      // Distribute data among agents
      const distributions = [];
      const itemsPerAgent = Math.floor(data.length / agents.length);
      const remainder = data.length % agents.length;

      let currentIndex = 0;
      agents.forEach((agent, index) => {
        // Calculate how many items this agent should get
        const itemsForThisAgent = itemsPerAgent + (index < remainder ? 1 : 0);
        
        for (let i = 0; i < itemsForThisAgent; i++) {
          if (currentIndex < data.length) {
            distributions.push({
              agentId: agent.id,
              ...data[currentIndex]
            });
            currentIndex++;
          }
        }
      });

      // Insert distributed data into database
      const stmt = db.prepare('INSERT INTO lists (agent_id, first_name, phone, notes) VALUES (?, ?, ?, ?)');
      
      let insertedCount = 0;
      distributions.forEach((item) => {
        stmt.run([item.agentId, item.firstName, item.phone, item.notes], (err) => {
          if (err) {
            console.error('Error inserting item:', err.message);
          } else {
            insertedCount++;
          }
        });
      });

      stmt.finalize((err) => {
        // Delete uploaded file after processing
        fs.unlinkSync(filePath);

        if (err) {
          return res.status(500).json({ error: 'Failed to save data', details: err.message });
        }

        res.json({
          message: 'File uploaded and distributed successfully',
          totalItems: data.length,
          agentsCount: agents.length,
          inserted: insertedCount
        });
      });
    });
  } catch (error) {
    // Delete uploaded file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ error: 'Failed to process file', details: error.message });
  }
});

// Get distributed lists for all agents
router.get('/distributions', authenticateToken, (req, res) => {
  const query = `
    SELECT 
      agents.id as agent_id,
      agents.name as agent_name,
      agents.email as agent_email,
      lists.id as list_id,
      lists.first_name,
      lists.phone,
      lists.notes,
      lists.created_at
    FROM agents
    LEFT JOIN lists ON agents.id = lists.agent_id
    ORDER BY agents.id, lists.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    // Group by agents
    const agentMap = {};
    rows.forEach(row => {
      if (!agentMap[row.agent_id]) {
        agentMap[row.agent_id] = {
          agentId: row.agent_id,
          agentName: row.agent_name,
          agentEmail: row.agent_email,
          lists: []
        };
      }

      if (row.list_id) {
        agentMap[row.agent_id].lists.push({
          id: row.list_id,
          firstName: row.first_name,
          phone: row.phone,
          notes: row.notes,
          createdAt: row.created_at
        });
      }
    });

    const distributions = Object.values(agentMap);
    res.json(distributions);
  });
});

module.exports = router;
