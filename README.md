node-http-proxy
===============

a simple http proxy server for node.js with the ability to modify the response. written to scratch an itch.

## api

### createServer([handler])

creates a new http proxy server. returns an instance of the server, which is basically a process.http.Server. the `handler` parameter is optional. if passed in, it will be called with the body and the headers of the server's response. this handler _must_ return an instance of `promise` which should emit a success event with the body to be sent to the client as the only parameter. see the second example below.

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

this will start an http proxy server at port 8000 and log the content-type in the response header to a file. 

        var sys = require("sys"),
            posix = require("posix"),
            Promise = require('events').Promise,
            proxy = require("./http-proxy");

        posix.open("./log.txt", process.O_WRONLY | process.O_CREAT, 0666).addCallback(function(fd) {
          var s = proxy.createServer(function(body, headers) {
            var promise = new Promise();
            posix.write(fd, headers["content-type"] + "\n").addCallback(function(b) {
              promise.emitSuccess(body);  
            });
            return promise;
          });

          s.addListener("close", function(errno) {
            posix.close(fd).wait();
          });

          s.listen(8000);
        });

## modifying the response:

this will modify the body. note that it returns a promise.

        var proxy = require('./http-proxy'),
            Promise = require('events').Promise;

        s = proxy.createServer(function(body, headers) {
          var promise = new Promise();
          // you should really check for what the body type is
          // as you will get _all_ responses, including images.
          // you can use the headers to figure things out.
          promise.emitSuccess(body.replace(/foo/ig, "bar"));
          return promise;
        }).listen(8000);



## limitations

* you cannot modify the response headers.
* if you define a handler, the response is _not_ chunked. if it was, processing text in the handler would be less useful.
* doesn't support gzip, etc. encoded content.
* probably more.

## info

* http://github.com/ryland/node-http-proxy
