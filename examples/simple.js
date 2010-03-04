var proxy = require('../http-proxy'),
    sys = require('sys');

//proxy.createServer().listen(8000);

s = proxy.createServer();
s.addListener("close", function(errno) {
  sys.puts("closed connection.");
});
s.listen(8000);
setTimeout(function() { s.close() }, 6000);
