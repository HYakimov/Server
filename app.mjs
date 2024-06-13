import express from 'express';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
const app = express();
app.use(express.json());
//enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Create a new SQLite database
const db = new sqlite3.Database('data.db');

// Create a table to store the data
db.run(`CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    age INTEGER,
    score INTEGER
)`);

app.use(bodyParser.json());

app.get('/data', (req, res) => {
    const sortBy = req.query.sortBy;
    let sql = 'SELECT * FROM scores';
    if (sortBy) {
        sql += ` ORDER BY ${sortBy} DESC`;
    }

    db.all(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(200).send(rows);
        }
    });
});

app.post('/data', (req, res) => {
    const { firstName, lastName, age, score } = req.body;
    
    db.run('INSERT INTO scores (firstName, lastName, age, score) VALUES (?, ?, ?, ?)', [firstName, lastName, age, score], function (err) {
        if (err) {
            res.status(500).send('Error saving data:', err);
        } else {
            res.status(200).send('Data saved successfully');
        }
    });
});

app.put('/data/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, age, score } = req.body;

    db.run('UPDATE scores SET firstName = ?, lastName = ?, age = ?, score = ? WHERE id = ?', [firstName, lastName, age, score, id], function (err) {
        if (err) {
            res.status(500).send('Error updating data:', err);
        } else if (this.changes === 0) {
            res.status(404).send('No entry found with the specified ID');
        } else {
            res.status(200).send('Data updated successfully');
        }
    });
});

app.delete('/data', (req, res) => {
    db.run('DELETE FROM scores', function (err) {
        if (err) {
            res.status(500).send('Error deleting data');
        } else {
            res.status(200).send('All entries deleted successfully');
        }
    });
});

app.delete('/data/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM scores WHERE id = ?', id, function (err) {
        if (err) {
            res.status(500).send('Error deleting data');
        } else {
            if (this.changes > 0) {
                res.status(200).send(`Entry with ID ${id} deleted successfully`);
            } else {
                res.status(404).send(`Entry with ID ${id} not found`);
            }
        }
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));