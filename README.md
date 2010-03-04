node-http-proxy
===============

a simple http proxy server for node.js with the ability to modify the response. written to scratch an itch.

## api

### createServer([handler])

creates a new http proxy server. returns an instance of the server, which is basically a process.http.Server. the `handler` parameter is optional. if passed in, it will be called with the body and the headers of the server's response. this handler _must_ take `header`, `body`, and a `callback` function as the parameters. if you are doing something with the response, you send it to the client by invoking the passed in callback parameter with the new headers and body. see the second example below.

as this is similar to http.createServer, you should be able to listen for the same events that it emits.

### listen(port)

start the proxy server on the given `port`.

### close()

stop the proxy server. 


## simple usage:

this will start an http proxy server at port 8000.

        var proxy = require('./http-proxy'),
            sys = require('sys');

        s = proxy.createServer().listen(8000);


## slightly more complex usage:

this will start an http proxy server at port 8000 and log the content-type in the response header to a file. take note of the handler's signature and how it uses the callback parameter.

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


## modifying the response:

this will modify the body. note that it returns a promise. note that if you modify the content in any meaningful way, you will probably want to update the `content-length` header as well.


        var proxy = require('../http-proxy');

        s = proxy.createServer(function(headers, body, callback) {
          callback(headers, body.replace(/foo/ig, "bar"));
        }).listen(8000);


## examples

there are some simple scripts in the `examples/` directory.

## limitations

* if you define a handler, the response is _not_ chunked. if it was, processing text in the handler would be less useful.
* doesn't support gzip, etc. encoded content.
* probably more.

## info

* http://github.com/ryland/node-http-proxy
