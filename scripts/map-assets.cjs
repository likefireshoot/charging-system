// Serve local map resources only. Business APIs are handled by the backend.
const http = require('http');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const assets = path.resolve(option('--assets', path.join(__dirname, '../map-assets')));
const port = Number(option('--port', '8094'));
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid map resource port');
for (const file of ['style-light.json', 'regions.json', '地图数据/china-20261010-z15.pmtiles', '地图数据/east-islands-20261010-z15.pmtiles']) {
  if (!fs.existsSync(path.join(assets, file))) throw new Error('Map resource missing: ' + file);
}
const mime = { '.html':'text/html; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.geojson':'application/geo+json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml',
  '.pbf':'application/x-protobuf', '.pmtiles':'application/vnd.pmtiles', '.txt':'text/plain; charset=utf-8',
  '.md':'text/plain; charset=utf-8', '.woff':'font/woff', '.woff2':'font/woff2' };
const server = http.createServer((request, response) => {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
  let route;
  try { route = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  if (!route.startsWith('/map-assets/')) { response.writeHead(404).end(); return; }
  const filename = path.resolve(assets, '.' + route.slice('/map-assets'.length));
  if (!filename.startsWith(assets + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
    response.writeHead(404).end(); return;
  }
  const stat = fs.statSync(filename), size = stat.size;
  const etag = '"' + size + '-' + Math.trunc(stat.mtimeMs) + '"';
  const headers = { 'Content-Type':mime[path.extname(filename)] || 'application/octet-stream',
    'Cache-Control':'no-cache', 'Accept-Ranges':'bytes', 'ETag':etag, 'X-Content-Type-Options':'nosniff' };
  if (request.headers['if-match'] && request.headers['if-match'] !== '*' && request.headers['if-match'] !== etag) {
    response.writeHead(412, headers).end(); return;
  }
  if (!request.headers.range && request.headers['if-none-match'] === etag) { response.writeHead(304, headers).end(); return; }
  let start = 0, end = size - 1, status = 200;
  if (request.headers.range) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range);
    if (!match) { response.writeHead(416, { 'Content-Range':`bytes */${size}` }).end(); return; }
    start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
      response.writeHead(416, { 'Content-Range':`bytes */${size}` }).end(); return;
    }
    status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = Math.max(0, end - start + 1);
  response.writeHead(status, headers);
  if (request.method === 'HEAD' || !size) { response.end(); return; }
  const stream = fs.createReadStream(filename, { start, end });
  stream.on('error', () => response.destroy()); response.on('close', () => stream.destroy()); stream.pipe(response);
});
server.listen(port, '127.0.0.1', () => console.log(`Map resources: http://127.0.0.1:${port}/map-assets/`));
