const assert = require('assert');
const sinon = require('sinon');

const ipcHelper = require('../../lib/utils/ipcHelper');
const logger = require('../../lib/utils/logger');
const SuitestError = require('../../lib/utils/SuitestError');

const ipcServerMock = {
	address: () => ({port: 1}),
	listen: (_, __, errorCb) => errorCb(1),
};

describe('ipcHelper util', () => {
	beforeEach(() => {
		sinon.stub(logger, 'debug');
	});

	afterEach(() => {
		logger.debug.restore();
	});

	it('ipcHelper.handleIpcError should handle error with EADDRINUSE errno', () => {
		const error = new Error();

		error.errno = 'EADDRINUSE';

		assert.throws(
			() => ipcHelper.handleIpcError(ipcServerMock)(error),
			err => err.type === SuitestError.type,
			'falied to parse json'
		);
	});

	it('ipcHelper.handleIpcError should handle error with non EADDRINUSE errno', () => {
		const error = new Error();

		ipcHelper.handleIpcError(ipcServerMock)(error);
		assert(logger.debug.called);
	});

	it('ipcHelper.startIpc should return promise', () => {
		const promise = ipcHelper.startIpc(ipcServerMock).catch(() => { /* caught */ });

		assert.ok(promise instanceof Promise);
	});

	it('ipcHelper.writeMessage should stringify message correctly', () => {
		assert.strictEqual(ipcHelper.writeMessage('id'), '{"id":"id","data":{}}');
		assert.strictEqual(ipcHelper.writeMessage('id', {}), '{"id":"id","data":{}}');
		assert.strictEqual(ipcHelper.writeMessage('id', {test: 1}), '{"id":"id","data":{"test":1}}');
	});
});
