//Meant to serve files
const http = require('http');
const fs = require('fs');

const hostname = 'localhost';
const port = 8081;
const mimeTypes = {
  "html": "text/html",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "png": "image/png",
  "svg": "image/svg+xml",
  "json": "application/json",
  "js": "text/javascript",
  "css": "text/css",
  "bin": "application/octet-stream",
};

const server = http.createServer((req, res) => {
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    const mimeType = mimeTypes[req.url.split('.').pop()];
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(data);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});