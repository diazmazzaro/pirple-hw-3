// App Dependencies
var utils = require('../utils');

var statics = {};

var HTML_index = '' +
'<html>' +
  '<head>' +
    '<!-- General Settings -->' +
    '<meta charset="utf-8">' +
    '<meta http-equiv="content-language" content="en-us">' +
    '<base href="{global.baseUrl}" />' +
    '<!-- Meta Tags -->' +
    '<title>{head.title} | {global.appName}</title>' +
    '<meta name="description" content="{head.description}">' +
    '<!-- Static Assets -->' +
    '<link type="image/x-icon" rel="icon" href="favicon.ico">' +
    '<script type="text/javascript" charset="utf-8" src="public/app.js"></script>' +
    '<link rel="stylesheet" type="text/css" href="public/app.css" />' +
  '</head>' +
  '<body class="{body.class}">' +
  	'Hello World!' +
  '</body>' +
 '</html>';

statics.tmpIndex = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Callback the data
    callback(200,HTML_index,'html');
  } else {
    callback(405);
  }
};

statics.favicon = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Read in the favicon's data
    utils.getStaticAsset('favicon.ico',function(err,data){
      if(!err && data){
        // Callback the data
        callback(200,data,'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
statics.public = function(data,callback){
  // Reject any request that isn't a GET
  if(data.method == 'get'){
    // Get the filename being requested
    var trimmedAssetName = data.path.replace('public/','').trim();
    if(trimmedAssetName.length > 0){
      // Read in the asset's data
      utils.getStaticAsset(trimmedAssetName,function(err,data){
        if(!err && data){

          // Determine the content type (default to plain text)
          var contentType = 'plain';

          if(trimmedAssetName.indexOf('.css') > -1){
            contentType = 'css';
          }

          if(trimmedAssetName.indexOf('.png') > -1){
            contentType = 'png';
          }

          if(trimmedAssetName.indexOf('.jpg') > -1){
            contentType = 'jpg';
          }

          if(trimmedAssetName.indexOf('.ico') > -1){
            contentType = 'favicon';
          }

          // Callback the data
          callback(200,data,contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }

  } else {
    callback(405);
  }
};

module.exports = statics;