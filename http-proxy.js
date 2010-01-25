var sys = require('sys'), 
    http = require('http')
    events = require('events');

exports.filteredHeaders = ['proxy-connection', 'set-cookie', 'accept-encoding', 
'connection', 'keep-alive', 'proxy-authenticate', 'upgrade', 'proxy-authorization', 'trailers', 'transfer-encoding'];

// return a copy of headers that have been sanitized
function cleanHeaders(h) {
  cleaned = {};
  for(var p in h) {
    if (exports.filteredHeaders.indexOf(p) == -1) {
      cleaned[p] = h[p];
    }
  }
  return cleaned;
}

function responseContentType(headers) {
  try {
    if (headers['content-encoding'] == "gzip" || 
        (headers['content-type'].indexOf("text/") == -1)) {
      return "binary";
    } else {
      return "ascii"
    }
  } catch(e) {
    return "ascii";
  }
}

exports.createServer = function(handler) { 
  return http.createServer(function (req, res) {
    var client = http.createClient(req.headers.port || 80, req.headers.host),
        upstream_req = client.request(req.method.toUpperCase(), req.url, cleanHeaders(req.headers)),
        req_buffer = "", 
        res_buffer = "";

    req.addListener("body", function(chunk) {
      upstream_req.sendBody(chunk);
    });

    upstream_req.finish(function(upstream_res) {
      // close connection
      upstream_res.headers['connection'] = 'close';
      upstream_res.headers['proxy-connection'] = 'close';
      res.sendHeader(upstream_res.statusCode, upstream_res.headers);

      var encoding = responseContentType(upstream_res.headers);

      upstream_res.setBodyEncoding(encoding);

      upstream_res.addListener("body", function(chunk) {
        if (handler !== undefined) {
          // handler will need full body
          res_buffer = res_buffer + chunk;
        } else {
          res.sendBody(chunk, encoding);
        }
      });

      upstream_res.addListener("complete", function() {
        if (handler !== undefined) {
          handler(res_buffer, upstream_res.headers).addCallback(
            function(body) { 
              res.sendBody(body, encoding);
              res.finish();
            });
        } else {
          res.finish();
        }
      });
    });
  });
}
