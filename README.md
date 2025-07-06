# URL Shortener Microservice

A secure and rate-limited URL shortener built with Node.js and Express.

## Features

- POST a URL to `/api/shorturl` to get a shortened version
- GET `/api/shorturl/:id` redirects to the original URL
- Validates URLs using `dns.lookup`
- Stores data in-memory
- Includes security headers, CORS, rate limiting, and logging