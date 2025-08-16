const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Hello World</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>Hello World!</h1>
      <p>Server is running successfully on port 3000</p>
      <p>The app has been fixed and is now functional!</p>
    </body>
    </html>
  `);
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
