var sys = require('sys'), 
    http = require('http')
    events = require('events');

exports.filteredHeaders = ['proxy-connection', 'set-cookie', 'accept-encoding', 
'connection', 'keep-alive', 'proxy-authenticate', 'upgrade', 'proxy-authorization', 'trailers', 'transfer-encoding'];

// return a headers with all filteredHeaders removed
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
      return "utf8"
    }
  } catch(e) {
    return "utf8";
  }
}

exports.createServer = function(handler) { 
  return http.createServer(function (req, res) {
    var client = http.createClient(req.headers.port || 80, req.headers.host),
        upstream_req = client.request(req.method.toUpperCase(), req.url, cleanHeaders(req.headers)),
        res_buffer = "",
        sent_headers = false;

    req.addListener("data", function(chunk) {
      upstream_req.write(chunk);
    });

    upstream_req.addListener('response', function(upstream_res) {
      var encoding = responseContentType(upstream_res.headers);

      // close connection
      upstream_res.headers['connection'] = 'close';
      upstream_res.headers['proxy-connection'] = 'close';

      upstream_res.addListener("data", function(chunk) {
        if (handler !== undefined) {
          // handler will need full body
          res_buffer = res_buffer + chunk;
        } else {
          if (!sent_headers) { 
            res.writeHeader(upstream_res.statusCode, upstream_res.headers);
            sent_headers = true;
          }
          res.write(chunk, encoding);
        }
      });

      upstream_res.addListener("end", function() {
        if (handler !== undefined) {
          handler(upstream_res.headers, res_buffer, function(headers, body) {
              res.writeHeader(upstream_res.statusCode, headers);
              res.write(body, encoding);
              res.close();
            });
        } else {
          res.close();
        }
      });
    });
    upstream_req.close();
  });
}
