require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('node:path');
const rateLimit = require('express-rate-limit');
const { URL } = require('node:url');

const app = express();
const urlDatabase = [];

app.use(bodyParser.urlencoded());
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('public'));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV !== 'production' ? 'dev' : 'combined'));
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests, please try again later',
    })
);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// --- API ---
app.post('/api/shorturl', (req, res) => {
    const inputUrl = req.body.url;

    let hostname;
    try {
        const parsed = new URL(inputUrl);
        hostname = parsed.hostname;
    } catch (err) {
        return res.json({ error: 'invalid url' });
    }

    dns.lookup(hostname, (err, address, family) => {
        if (err) {
            return res.json({ error: 'invalid url' });
        }

        console.log('Found address: %j family: IPv%s', address, family);

        const existing = urlDatabase.find(
            (entry) => entry.original_url === inputUrl
        );

        if (existing) {
            return res.json(existing);
        }

        const newEntry = {
            original_url: inputUrl,
            short_url: urlDatabase.length + 1,
        };

        urlDatabase.push(newEntry);
        return res.json(newEntry);
    });
});

app.get('/api/shorturl/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const entry = urlDatabase.find((entry) => entry.short_url === id);

    if (entry) {
        return res.redirect(entry.original_url);
    }

    return res.status(404).json({
        error: 'No short URL for given input was found',
    });
});
// -----------

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const shutdown = () => {
    console.log('Gracefully shutting down...');

    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Forced shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
