const http = require('http');
const fs = require('fs');
var io;

const hostname = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  switch (req.url) {
    case "/":
      sendFile(res, __dirname + "/public/index.html");
      break;
    default:
      if(req.url.indexOf("/data/") != -1) {
        sendFile(res, __dirname + decodeURI(req.url));
      }
      else {
        sendFile(res, __dirname + "/public/" + req.url);
      }
  }
});

io = require('socket.io')(server);

io.on('connection', socket => {
  socket.on('loadTracks', (data) => {
    if(data == "init") {
      if(!fs.existsSync(__dirname + "/data/")) {
        fs.mkdirSync(__dirname + "/data/");
      }
      var tracks = [];
      fs.readdir(__dirname + "/data/", {withFileTypes: true}, (err, files) => {
        if (err) {
          console.log(err);
        }
        else {
          files.forEach((file) => {
            if(file.isFile() && file.name.indexOf(".gpx") >= 0) {
              tracks.push("data/" + file.name);
            }
          });
          io.emit("trackList", tracks);
        }
      });
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function sendFile(res, url) {
  fs.readFile(url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}
