var sys = require("sys"),
    fs = require("fs"),
    proxy = require("../http-proxy");

fs.open("./log.txt", process.O_WRONLY | process.O_CREAT, 0666, function(err, fd) {
  var s = proxy.createServer(function(headers, body, callback) {
    fs.write(fd, "-> " + headers["content-type"] + "\n", null, "utf8", function(err, b) {
      callback(headers, body);
    });
  });

  s.addListener("close", function(errno) {
    fs.closeSync(fd);
  });

  s.listen(8000);
});



