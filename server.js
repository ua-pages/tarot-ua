import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, 'public');
const envPath = path.resolve(__dirname, '.env');
const port = parseInt(process.env.PORT || '5173', 10);
const spaPaths = ['/', '/session', '/fast-session', '/journal', '/library', '/meaning/', '/spreads/', '/share/'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.json': 'application/json',
};

function parseEnv(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const eqIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }
  return env;
}

const env = parseEnv(envPath);

function injectEnv(html) {
  const envLine = `window.ENV = ${JSON.stringify(env)};`;
  return html.replace('window.ENV = window.ENV || {};', envLine);
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function serveIndex(req, res) {
  const indexPath = path.join(publicDir, 'index.html');
  try {
    let html = fs.readFileSync(indexPath, 'utf8');
    html = injectEnv(html);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } catch {
    res.writeHead(500);
    res.end('Internal error');
  }
}

function isSpaRoute(url) {
  for (const spa of spaPaths) {
    if (url.startsWith(spa)) return true;
  }
  return false;
}

import http from 'node:http';

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  const pagePath = url.pathname.replace(/^\/tarot-ua(?=\/|$)/, '');
  const cleanPath = pagePath === '/' ? 'index.html' : pagePath.slice(1);
  const filePath = path.join(publicDir, cleanPath);
  const ext = path.extname(url.pathname);

  if (ext && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(res, filePath);
  }
  if (isSpaRoute(url.pathname) || url.pathname === '/') {
    return serveIndex(req, res);
  }
  const altPath = path.join(publicDir, url.pathname.slice(1), 'index.html');
  if (fs.existsSync(altPath)) {
    return serveFile(res, altPath);
  }
  return serveIndex(req, res);
});

server.listen(port, () => {
  console.log(`Tarot UA web server running at http://localhost:${port}`);
});
