const Raven = require('raven');
const assert = require('assert');
const {handleProgress} = require('../../lib/utils/progressHandler');
const translate = require('../../lib/utils/translateResults');
const sinon = require('sinon');

describe('progressHandler', () => {
	let translateProgress = () => null;

	beforeEach(() => {
		sinon.stub(Raven, 'captureException');
		translateProgress = sinon.stub(translate, 'translateProgress');
	});

	afterEach(() => {
		Raven.captureException.restore();
		translate.translateProgress.restore();
	});

	it('Should handle positive scenario', () => {
		const logger = {log: sinon.spy()};

		translateProgress.returns('my translation');
		handleProgress(logger, {status: 1, code: 'A'});
		assert.strictEqual(logger.log.firstCall.args[0], '  - my translation');
		assert.deepStrictEqual(translateProgress.firstCall.args[0], {status: 1, code: 'A'});
	});

	it('Should handle empty message', () => {
		const logger = {log: sinon.spy()};

		translateProgress.returns('');
		handleProgress(logger, {status: 1, code: 'A'});
		assert.strictEqual(logger.log.firstCall, null);
	});

	it('Should handle thrown exception', () => {
		const logger = {log: sinon.spy()};
		const error = new Error('my error');

		translateProgress.throws(error);
		handleProgress(logger, {status: 1, code: 'A'});
		assert.strictEqual(logger.log.firstCall, null);
		assert.strictEqual(Raven.captureException.firstCall.args[0], error);
	});
});
