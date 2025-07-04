require('dotenv').config();

const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();

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

// body-parser - for post request
// dns.lookup (host, cb) - to verify a submitted URL

app.post('/api/shorturl', (req, res) => {
    res.json({ result: 'POST request to homepage' });
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
