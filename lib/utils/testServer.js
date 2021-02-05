/* istanbul ignore file */
/**
 * Test http and ws local mocked server.
 */

const MockServer = require('mock-socket').Server;
const {wsUrl} = require('../../config');

let wsServer,
	_respondWithSuccess = true,
	_respondWithContent;

const respondMocksMap = new Map();

function start() {
	return new Promise(resolve => {
		wsServer = new MockServer(wsUrl);
		wsServer.on('connection', ws => {
			ws.on('message', msg => {
				const parsedMsg = JSON.parse(msg);
				const respondMockFn = [...respondMocksMap.keys()].find((matchFn) => matchFn(parsedMsg));

				ws.send(JSON.stringify({
					messageId: parsedMsg.messageId,
					content: respondMockFn
						? respondMocksMap.get(respondMockFn)
						: _respondWithContent || {result: _respondWithSuccess ? 'success' : 'fail'},
				}));
			});
		});

		resolve();
	});
}

function mockRespondData(matchFn, content) {
	respondMocksMap.set(matchFn, content);

	return () => respondMocksMap.delete(matchFn);
}

function respondWithSuccess(value) {
	_respondWithSuccess = value;
}

function respondWithContent(content) {
	_respondWithContent = content;
}

function closeServer(wsServer) {
	return wsServer && wsServer.stop();
}

async function stop() {
	wsServer = await closeServer(wsServer);

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
	mockRespondData,
};
