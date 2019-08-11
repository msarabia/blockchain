let blockchain = require("./core");
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var logger       = require('morgan');
var Liquid       = require("liquidjs");
var routes 		 = require("routes");
var http		 = require("http");
var debug 		 = require('debug')('http');


var app = express();

// Define liquid Templates class
const engine = new Liquid({
    root   : __dirname, // for layouts and partials
    extname: '.liquid'
});
app.engine('liquid', engine.express()); // register liquid engine
app.set('views', ['./views/partials', './views']);// specify the views directory
app.set('view engine', 'liquid'); // set to default


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var port = 3000;
app.set('port', port);
var server = http.createServer(app);

server.listen(port)
server.on('error', onError);
server.on('listening', onListening);



function onError(error) {
	if (error.syscall !== 'listen') throw error;
	console.log(error.toString());
}

function onListening() {
	
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

