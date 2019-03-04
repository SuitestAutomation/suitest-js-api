const sinon = require('sinon');
const assert = require('assert');

const ipcHelper = require('../../lib/testLauncher/ipc/ipcHelper');

describe('ipcHelper', () => {
	it('ipcHelper.getState', () => {
		assert.deepEqual(ipcHelper.getState({test: true})(), {test: true});
	});

	it('ipcHelper.addListener should add callback to state listeners', () => {
		const state = {listeners: {}};
		const callback = () => void 0;

		ipcHelper.addListener(state)('id', callback);
		assert.strictEqual(state.listeners.id, callback);
	});

	it('ipcHelper.removeListener should remove callback from state listeners', () => {
		const state = {listeners: {id: () => void 0}};

		ipcHelper.removeListener(state)('id');
		assert.strictEqual(state.listeners.hasOwnProperty('id'), false);
	});

	it('ipcHelper.write should call write method on socket with stringified data', () => {
		const socket1 = {write: sinon.stub()};

		ipcHelper.write(socket1, 'id', {test: true});
		assert.ok(socket1.write.calledOnce);
		assert.ok(socket1.write.calledWith('{"id":"id","data":{"test":true}}'));

		const socket2 = {write: sinon.stub()};

		ipcHelper.write(socket2, 'id');
		assert.ok(socket2.write.calledOnce);
		assert.ok(socket2.write.calledWith('{"id":"id","data":{}}'));
	});

	it('ipcHelper.broadcast should write to all state connections', () => {
		const state = {
			connections: {
				'1': {write: sinon.stub()},
				'2': {write: sinon.stub()},
			},
		};

		ipcHelper.broadcast(state)('id', {});
		assert.ok(state.connections['1'].write.calledWith('{"id":"id","data":{}}'));
		assert.ok(state.connections['2'].write.calledWith('{"id":"id","data":{}}'));
	});

	it('ipcHelper.handleMessage should parse message and call listeners callback if present', () => {
		const state1 = {listeners: {id: sinon.stub()}};

		ipcHelper.handleMessage(state1)(Buffer.from('{"id":"id","data":"data"}'));
		assert.ok(state1.listeners.id.calledOnce);
		assert.ok(state1.listeners.id.calledWith('data'));

		const state2 = {listeners: {id: sinon.stub()}};

		ipcHelper.handleMessage(state2)(Buffer.from('{"id":"wrongId","data":"data"}'));
		assert.ok(state2.listeners.id.notCalled);
	});
});
