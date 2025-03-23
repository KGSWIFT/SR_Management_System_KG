const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // السماح بجميع الطلبات من أي مصدر

// إعداد الاتصال بقاعدة البيانات
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// التحقق من الاتصال بقاعدة البيانات
pool.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
    } else {
        console.log('Successfully connected to the database');
    }
});

// جلب جميع المعاملات
app.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transactions');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
    }
});

// إضافة معاملة جديدة
app.post('/transactions', async (req, res) => {
    const { id, engineer, type, date, created_at } = req.body;
    try {
        await pool.query(
            'INSERT INTO transactions (id, engineer, type, date, created_at) VALUES ($1, $2, $3, $4, $5)',
            [id, engineer, type, date, created_at]
        );
        res.status(201).json({ message: 'Transaction added successfully' });
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction', details: error.message });
    }
});

// حذف معاملة
app.delete('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
    }
});

// تحديث معاملة
app.put('/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const { engineer, type, date } = req.body;
    try {
        const result = await pool.query(
            'UPDATE transactions SET engineer = $1, type = $2, date = $3 WHERE id = $4',
            [engineer, type, date, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ message: 'Transaction updated successfully' });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction', details: error.message });
    }
});

// تشغيل الخادم
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
