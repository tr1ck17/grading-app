// reset_db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run('DELETE FROM evaluations', err => {
    if (err) console.error('Error clearing submissions:', err);
    else console.log('✅ All submissions cleared.');
  });
  db.run('VACUUM', err => {
    if (err) console.error('Error vacuuming database:', err);
    else console.log('✅ Database vacuumed.');
  });
});

db.close();
