const express   = require('express');
const bodyParser = require('body-parser');
const sqlite3    = require('sqlite3').verbose();
const cors       = require('cors');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('database.db', err => {
  if (err) console.error(err.message);
  else console.log('Connected to SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupName TEXT NOT NULL,
    fromMember TEXT NOT NULL,
    toMember TEXT NOT NULL,
    points INTEGER NOT NULL,
    timeSubmitted DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 1️⃣ Check-submission endpoint
app.get('/api/submitted', (req, res) => {
  const { groupName, fromMember } = req.query;
  if (!groupName || !fromMember) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  db.get(
    `SELECT COUNT(*) AS cnt 
       FROM evaluations 
      WHERE groupName = ? 
        AND fromMember = ?`,
    [groupName, fromMember],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ submitted: row.cnt > 0 });
    }
  );
});

// 2️⃣ Submit endpoint now rejects duplicates
app.post('/submit', (req, res) => {
  const { groupName, fromMember, results } = req.body;
  if (!groupName || !fromMember || !Array.isArray(results)) {
    return res.status(400).send("Invalid submission format.");
  }

  // First, check if they already submitted
  db.get(
    `SELECT COUNT(*) AS cnt 
       FROM evaluations 
      WHERE groupName = ? 
        AND fromMember = ?`,
    [groupName, fromMember],
    (err, row) => {
      if (err) return res.status(500).send("Database error.");
      if (row.cnt > 0) {
        return res.status(403).send("You have already submitted.");
      }

      // Not yet submitted → insert
      const stmt = db.prepare(`
        INSERT INTO evaluations (groupName, fromMember, toMember, points)
        VALUES (?, ?, ?, ?)
      `);
      db.serialize(() => {
        for (let entry of results) {
          stmt.run(groupName, fromMember, entry.name, entry.points);
        }
        stmt.finalize(err => {
          if (err) return res.status(500).send("Database error.");
          res.status(200).send("Success");
        });
      });
    }
  );
});

// Admin-only endpoints remain as before…
app.get('/api/results', (req, res) => {
  if (req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    return res.status(403).send("Forbidden");
  }
  db.all(
    `SELECT groupName, fromMember, toMember, points 
       FROM evaluations`,
    (err, rows) => {
      if (err) return res.status(500).send("Database error.");
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/*app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});*/


/*const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('database.db', err => {
    if (err) console.error(err.message);
    else console.log('Connected to SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupName TEXT NOT NULL,
    fromMember TEXT NOT NULL,
    toMember TEXT NOT NULL,
    points INTEGER NOT NULL,
    timeSubmitted DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST /submit stays the same
app.post('/submit', (req, res) => {
  const { groupName, fromMember, results } = req.body;
  if (!groupName || !fromMember || !Array.isArray(results)) {
    return res.status(400).send("Invalid submission format.");
  }

  const stmt = db.prepare(`
    INSERT INTO evaluations (groupName, fromMember, toMember, points)
    VALUES (?, ?, ?, ?)
  `);

  db.serialize(() => {
    for (let entry of results) {
      stmt.run(groupName, fromMember, entry.name, entry.points);
    }
    stmt.finalize(err => {
      if (err) return res.status(500).send("Database error.");
      res.status(200).send("Success");
    });
  });
});

// GET /api/results now returns raw rows
const ADMIN_PASSWORD = 'admin123';  // adjust as needed

app.get('/api/results', (req, res) => {
  const pw = req.headers['x-admin-password'];
  if (pw !== ADMIN_PASSWORD) {
    return res.status(403).send("Forbidden");
  }

  db.all(
    `SELECT groupName, fromMember, toMember, points FROM evaluations`,
    (err, rows) => {
      if (err) return res.status(500).send("Database error.");
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});*/
 

/*const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to SQLite database.');
});

db.run(`
    CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupName TEXT NOT NULL,
        fromMember TEXT NOT NULL,
        toMember TEXT NOT NULL,
        points INTEGER NOT NULL,
        timeSubmitted DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Route to handle form submission
app.post('/submit', (req, res) => {
    const { groupName, fromMember, results } = req.body;

    if (!groupName || !fromMember || !results || !Array.isArray(results)) {
        return res.status(400).send("Invalid submission format.");
    }

    const stmt = db.prepare(`
        INSERT INTO evaluations (groupName, fromMember, toMember, points)
        VALUES (?, ?, ?, ?)
    `);

    db.serialize(() => {
        results.forEach(entry => {
            stmt.run(groupName, fromMember, entry.name, entry.points);
        });

        stmt.finalize(err => {
            if (err) return res.status(500).send("Database error.");
            res.status(200).send("Success");
        });
    });
});

// Route for admin to view results
const ADMIN_PASSWORD = 'admin123'; // Change this to a secure password

app.get('/api/results', (req, res) => {
    const password = req.headers['x-admin-password'];

    if (password !== ADMIN_PASSWORD) {
        return res.status(403).send("Forbidden");
    }

    const query = `
        SELECT toMember AS name, SUM(points) AS score, MAX(timeSubmitted) AS time
        FROM evaluations
        GROUP BY toMember
        ORDER BY name
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).send("Database error.");
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
*/