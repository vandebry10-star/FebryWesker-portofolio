const express     = require('express');
const compression = require('compression');
const path        = require('path');

const app  = express();
const PORT = 3030;

app.use(compression());

// NO cache — semua file selalu fresh
app.use(express.static(path.join(__dirname), {
  etag: false,
  lastModified: false,
  setHeaders(res) {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});
