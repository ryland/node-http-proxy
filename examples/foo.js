// this script uses a handler to modify the upstream response before returning
// it to the client.

var proxy = require('../http-proxy');

s = proxy.createServer(function(headers, body, callback) {
  callback(headers, body.replace(/foo/ig, "bar"));
}).listen(8000);

