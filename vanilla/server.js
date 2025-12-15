const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Handle OPTIONS preflight
app.options('*', (req, res) => {
    res.sendStatus(204);
});

const DATA_FILE = path.join(__dirname, 'data', 'credentials.json');

async function readData() {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { credentials: [] };
    }
}

async function writeData(data) {
    await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Simple CRUD for credentials
app.get('/credentials', async (req, res) => {
    try {
        const data = await readData();
        res.json(data.credentials || []);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/credentials', async (req, res) => {
    try {
        const payload = req.body;
        const data = await readData();
        const id = String(Date.now());
        const entry = {
            id,
            site: payload.site || '',
            username: payload.username || '',
            password: payload.password || '',
            notes: payload.notes || '',
            tags: payload.tags || [],
            container: payload.container || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        data.credentials = data.credentials || [];
        data.credentials.unshift(entry);
        await writeData(data);
        res.json(entry);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/credentials/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const payload = req.body;
        const data = await readData();
        const idx = (data.credentials || []).findIndex(c => c.id === id);
        if (idx === -1) return res.status(404).json({ error: 'Not found' });
        data.credentials[idx] = { ...data.credentials[idx], ...payload, updatedAt: new Date().toISOString() };
        await writeData(data);
        res.json(data.credentials[idx]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/credentials/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await readData();
        data.credentials = (data.credentials || []).filter(c => c.id !== id);
        await writeData(data);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Import entries (array of credential objects)
app.post('/import-credentials', async (req, res) => {
    try {
        const entries = req.body.entries || [];
        const data = await readData();
        data.credentials = data.credentials || [];
        // normalize and add
        const now = new Date().toISOString();
        const added = entries.map(e => ({ id: String(Date.now() + Math.floor(Math.random()*1000)), site: e.site || '', username: e.username || '', password: e.password || '', notes: e.notes || '', tags: e.tags || [], container: e.container || null, createdAt: now, updatedAt: now }));
        data.credentials = [...added, ...data.credentials];
        await writeData(data);
        res.json({ addedCount: added.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/update-csv', async (req, res) => {
    try {
        const { tableId, rowIndex, columnIndex, newValue } = req.body;
        const fileName = tableId === 'devices-table' ? 'devices.csv' : 'website-pass.csv';
        const filePath = path.join(__dirname, 'CSVs', fileName);

        // Read the CSV file
        let content = await fs.readFile(filePath, 'utf-8');
        let rows = content.split('\n').map(row => row.split(','));

        // Update the specific cell
        rows[rowIndex + 1][columnIndex] = newValue; // +1 to skip header row

        // Write back to file
        const newContent = rows.map(row => row.join(',')).join('\n');
        await fs.writeFile(filePath, newContent, 'utf-8');

        res.json({ success: true });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});