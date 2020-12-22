const assert = require('assert');
const sinon = require('sinon');
const suitestInstance = require('../../index');
const {identity} = require('ramda');
const testServer = require('../../lib/utils/testServer');
const webSockets = require('../../lib/api/webSockets');
const {makeThenComposer} = require('../../lib/composers');
const suitest = {...suitestInstance, webSockets};
const SuitestError = require('../../lib/utils/SuitestError');

const noop = () => {
	// noop
};

describe('Then composer', () => {
	before(async() => {
		await testServer.start();
		await webSockets.connect();
	});

	beforeEach(() => {
		sinon.stub(suitest.authContext, 'authorizeWs').resolves();
	});

	afterEach(() => {
		suitest.authContext.authorizeWs.restore();
	});

	after(async() => {
		await webSockets.disconnect();
		await testServer.stop();
	});

	it('should define then method', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, makeThenComposer(noop, noop)(suitest, data, chain, makeChain));

		const thenPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'then');

		assert.strictEqual(typeof chain.then, 'function', 'is a Function');
		assert.strictEqual(thenPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(thenPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(thenPropertyDescriptor.writable, false, 'not writable');
	});

	it('should return Promise/A+ when called', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();
		const executorSpy = sinon.spy(identity);
		const callbackSpy = sinon.stub();
		const beforeSendSpy = sinon.stub();
		const success = sinon.spy(identity);
		const resolution = {};

		callbackSpy.resolves(resolution);

		Object.defineProperties(chain,
			makeThenComposer(executorSpy, callbackSpy, beforeSendSpy)(suitest, data, chain, makeChain));

		await chain.then(success);
		assert(success.calledWith(resolution));
	});

	it('should return Promise and handle rejection', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();
		const executorSpy = sinon.spy(identity);
		const callbackSpy = sinon.stub();
		const beforeSendSpy = sinon.stub();
		const fail = sinon.spy();
		const rejection = new Error();

		callbackSpy.rejects(rejection);

		Object.defineProperties(chain,
			makeThenComposer(executorSpy, callbackSpy, beforeSendSpy)(suitest, data, chain, makeChain));

		await chain.then(undefined, fail);
		assert(fail.calledWith(rejection));
	});

	it('should execute callback once even if then called twice', async() => {
		const data = {type: 'takeScreenshot', stack: ''};
		const chain = {};
		const makeChain = sinon.spy();
		const executorSpy = sinon.spy(identity);
		const callbackSpy = sinon.spy(identity);
		const beforeSpy = sinon.spy(identity);

		Object.defineProperties(chain,
			makeThenComposer(executorSpy, callbackSpy, beforeSpy)(suitest, data, chain, makeChain));

		await chain;
		await chain;

		assert(executorSpy.calledOnce);
	});

	it('should return error when ws not connected', async() => {
		await webSockets.disconnect();
		await testServer.stop();

		const data = {};
		const chain = {};
		const makeChain = sinon.spy();
		const executorSpy = sinon.spy(identity);
		const callbackSpy = sinon.spy(identity);
		const beforeSpy = sinon.spy(identity);

		Object.defineProperties(chain,
			makeThenComposer(executorSpy, callbackSpy, beforeSpy)(suitest, data, chain, makeChain));

		const error = await chain;

		assert(error instanceof SuitestError);
		assert(error.code === SuitestError.WS_ERROR);
	});
});
