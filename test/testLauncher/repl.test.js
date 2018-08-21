const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');

describe('repl', () => {
	before(() => {
		sinon.stub(repl, 'start').returns({
			close: () => void 0,
			context: {},
		});
		require('../../lib/utils/testHelpers/mocks').restoreRepl();
	});

	after(() => {
		repl.start.restore();
		require('../../lib/utils/testHelpers/mocks').stubRepl();
	});

	it('should test startRepl', async() => {
		const {startRepl} = require('../../lib/testLauncher/repl');
		const suitestInstance = {};
		const promise = startRepl(suitestInstance);

		assert.strictEqual(typeof suitestInstance.resume, 'function', 'resume method added');
		assert.strictEqual(repl.start.called, true, 'repl start called');

		setTimeout(suitestInstance.resume);
		await promise;

		assert.strictEqual(suitestInstance.resume, undefined, 'resume method deleted');
	});
});
