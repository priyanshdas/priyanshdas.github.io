"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".png": "image/png"
};

http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }

  const filename = path.resolve(root, "." + pathname);
  const relative = path.relative(root, filename);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    response.writeHead(403).end();
    return;
  }

  fs.stat(filename, (statError, stat) => {
    const target = !statError && stat.isDirectory() ? path.join(filename, "index.html") : filename;
    fs.readFile(target, (error, data) => {
      if (error) {
        response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(target).toLowerCase()] || "application/octet-stream",
        "Content-Length": data.length,
        "X-Content-Type-Options": "nosniff"
      });
      if (request.method === "HEAD") response.end();
      else response.end(data);
    });
  });
}).listen(5500, "127.0.0.1", () => {
  process.stdout.write("Portfolio preview: http://127.0.0.1:5500/index.html\n");
});
