/*
 * Library for http server
 *
 */


// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var util = require('util');
var debug = util.debuglog('server');
// App Dependencies
var router = require('./router');
var utils = require('./utils');



var server = {};

// Return status code in colors
server._getStatusCodeColorful = function(code){
  var str = code.toString()[0];
  return (str =='2' ? '\x1b[32m\x1b[1m' : str =='3' ? '\x1b[36m\x1b[1m' :str =='4' ? '\x1b[31m\x1b[1m' : str =='5' ? '\x1b[33m\x1b[1m' : '') + code + '\x1b[0m';
}

// Return status code in colors
server._getMethodeColorful = function(methode){
  return (methode =='get' ? '\x1b[32m\x1b[1m' : methode =='put' ? '\x1b[34m\x1b[1m' :methode =='delete' ? '\x1b[31m\x1b[1m' : methode =='post' ? '\x1b[33m\x1b[1m' : '') + methode + '\x1b[0m';
}

// All the server logic for both the http and https server
server.handler = function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);
  var _path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
  _path = _path ? _path.toLowerCase() :_path;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[_path]) !== 'undefined' ? router[_path] : router.notFound;

      // Construct the data object to send to the handler
      var data = {
        // Get the path
        'path' : _path,
        // Get the query string as an object
        'qsObj' : parsedUrl.query,
        // Get the HTTP method
        'method' : req.method.toLowerCase(),
        //Get the headers as an object
        'headers' : req.headers,
        // Get the payload,
        'payload' : utils.parseJSON(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,(statusCode,payload) => {

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        debug(new Date().toISOString().split('T')[1].replace('Z', ''), server._getMethodeColorful(data.method), ':', data.path, '-',server._getStatusCodeColorful(statusCode));
      });

  });
};


// Init http servers
server.init = function(config){
  if(typeof(config) == 'object'){
     // Instantiate the HTTP server
    server.httpServer = http.createServer((req, res)=>{
      server.handler(req,res);
    });

    // Start the HTTP server
    server.httpServer.listen(config.httpPort,function(){
      debug('The \x1b[32m\x1b[1mHTTP\x1b[0m server is running on port \x1b[34m\x1b[1m'+config.httpPort+'\x1b[0m');
    });
    // Instantiate the HTTPS server if exists config for it and SSL cert.
    if(config.httpsPort && config.ssl){
      // Instantiate the HTTPS server
      server.httpsServer = https.createServer(config.ssl,(req, res)=>{
        server.handler(req,res);
      });

      // Start the HTTPS server
      server.httpsServer.listen(config.httpsPort,function(){
       debug('The \x1b[31m\x1b[1mHTTPS\x1b[0m server is running on port \x1b[34m\x1b[1m'+config.httpsPort+'\x1b[0m');
      });
    }
  }
  else
    throw new Error('Invalid or empty \'cofig\' arg')
}


module.exports = server;



