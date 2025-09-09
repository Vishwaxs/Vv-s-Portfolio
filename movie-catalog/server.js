import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// GET /movies - Retrieve all movies
app.get('/movies', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM movies ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /movies - Add a new movie
app.post('/movies', async (req, res) => {
    try {
        const { title, director, genre, release_year, rating } = req.body;
        const [result] = await db.execute(
            'INSERT INTO movies (title, director, genre, release_year, rating) VALUES (?, ?, ?, ?, ?)',
            [title, director, genre, release_year, rating]
        );
        res.status(201).json({ id: result.insertId, message: 'Movie added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /movies/:id - Update an existing movie
app.put('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, director, genre, release_year, rating } = req.body;
        await db.execute(
            'UPDATE movies SET title = ?, director = ?, genre = ?, release_year = ?, rating = ? WHERE id = ?',
            [title, director, genre, release_year, rating, id]
        );
        res.json({ message: 'Movie updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /movies/:id - Delete a movie
app.delete('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM movies WHERE id = ?', [id]);
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
