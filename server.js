const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // استخدام متغير بيئي
});

app.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.post('/transactions', async (req, res) => {
    const { id, engineer, type, date, created_at } = req.body;
    try {
        await pool.query(
            'INSERT INTO transactions (id, engineer, type, date, created_at) VALUES ($1, $2, $3, $4, $5)',
            [id, engineer, type, date, created_at]
        );
        res.status(201).json({ message: 'Transaction added' });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

app.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

app.put('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { engineer, type, date } = req.body;
    try {
        await pool.query(
            'UPDATE transactions SET engineer = $1, type = $2, date = $3 WHERE id = $4',
            [engineer, type, date, id]
        );
        res.json({ message: 'Transaction updated' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));