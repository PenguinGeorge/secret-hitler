'use strict';

const https = require('https');
const express = require('express');
const fs = require('fs');
require('dotenv').config();
const securePort = (() => {
	const val = process.env.HTTPSPORT || '8443';
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
})();

global.app = express();

const privateKey = fs.readFileSync('/etc/letsencrypt/live/sh.nitro.wingless.co.uk/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/sh.nitro.wingless.co.uk/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/sh.nitro.wingless.co.uk/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const debug = require('debug')('app:server');
const server = https.createServer(credentials, app);

global.io = require('socket.io')(server);
global.notify = require('node-notifier');

app.set('port', securePort);
app.set('strict routing', true);

app.use(function(req, res, next) {
	if (req.secure) {
		next();
	} else {
		res.redirect('https://' + req.headers.host + req.url);	
	}
});

//httpServer.listen(port);
httpsServer.listen(securePort);

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof securePort === 'string' ? 'Pipe ' + securePort : 'Port ' + securePort;

	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
	console.log('Listening on ' + bind);
	require('../app');
}

server.on('error', onError);
server.on('listening', onListening);
