/*
 * Library for reques routing
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');

const PATH_handlers = './handlers';

// Default static handlers
var router = {
	notFound : function(data,callback){
	  callback(404, { msg : 'Endpoint not found.'});
	},
	ping : function(data,callback){
    callback(200, { echo : data.payload});
	}
}

// Load dynamic handlers
router.loadHandlers = function() {
	var dir = path.resolve(__dirname, PATH_handlers);
	fs.readdirSync(dir).forEach(file => {
	  var name = /^([^\.]+)/.exec(file)[1];
	  router[name] = require(path.resolve(dir, file)).requests;
	});
}

router.loadHandlers();

module.exports = router;