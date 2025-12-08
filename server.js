const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to disable caching for all responses (good for development)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

app.listen(PORT, () => {
  console.log(`Dev server running: http://localhost:${PORT}`);
  console.log('All responses include no-cache headers.');
});

// Optional: graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down dev server');
  process.exit();
});
