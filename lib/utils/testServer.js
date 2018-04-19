/* istanbul ignore file */
/**
 * Test http and ws local server.
 */

const http = require('http');
const express = require('express');
const WS = require('ws');

const port = 3000;
let httpServer,
	wsServer,
	_respondWithSuccess = true,
	_respondWithContent;

function start() {
	httpServer = http.createServer(express());

	return new Promise(resolve => {
		httpServer.listen(port, () => {
			wsServer = new WS.Server({server: httpServer});

			wsServer.on('connection', ws => {
				ws.on('message', msg => {
					const parsedMsg = JSON.parse(msg);

					ws.send(JSON.stringify({
						messageId: parsedMsg.messageId,
						content: _respondWithContent || {result: _respondWithSuccess ? 'success' : 'fail'},
					}));
				});
			});

			resolve();
		});
	});
}

function respondWithSuccess(value) {
	_respondWithSuccess = value;
}

function respondWithContent(content) {
	_respondWithContent = content;
}

function closeServer(server) {
	return new Promise(resolve => {
		if (server) {
			server.close(() => {
				server = null;
				resolve(null);
			});
		} else {
			resolve(null);
		}
	});
}

async function stop() {
	wsServer = await closeServer(wsServer);
	httpServer = await closeServer(httpServer);

	respondWithSuccess(true);

	return new Promise(res => setTimeout(() => res()));
}

async function restart() {
	await stop();
	await start();
}

module.exports = {
	start,
	stop,
	restart,
	respondWithSuccess,
	respondWithContent,
	closeServer,
};
