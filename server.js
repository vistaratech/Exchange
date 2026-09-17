/*
 * Dependency-free local server for the EXCHANGE MVP.
 * A production adapter can replace the static data layer with PostgreSQL using
 * database/schema.sql while retaining the /api namespace.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, 'public');
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self' https://images.unsplash.com; img-src 'self' https://images.unsplash.com data:; style-src 'self'; script-src 'self'; connect-src 'self'"
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/health') {
    return send(res, 200, JSON.stringify({ status: 'ok', product: 'EXCHANGE' }), 'application/json; charset=utf-8');
  }
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safePath = path.resolve(root, relative);
  if (!safePath.startsWith(root) || !fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
    return send(res, 404, 'Not found');
  }
  send(res, 200, fs.readFileSync(safePath), mimeTypes[path.extname(safePath)] || 'application/octet-stream');
});

const port = Number(process.env.PORT) || 4173;
server.listen(port, () => console.log(`EXCHANGE MVP available at http://localhost:${port}`));
