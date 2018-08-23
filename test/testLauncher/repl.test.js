const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');

describe('repl', () => {
	before(() => {
		sinon.stub(repl, 'start').returns({
			close: () => void 0,
			context: {},
			on: () => void 0,
		});
		require('../../lib/utils/testHelpers/mocks').restoreRepl();
	});

	after(() => {
		repl.start.restore();
		require('../../lib/utils/testHelpers/mocks').stubRepl();
		require('../../lib/testLauncher/repl').setActive(false);
	});

	it('should test startRepl', async() => {
		const {startRepl, isActive} = require('../../lib/testLauncher/repl');
		const suitestInstance = {};
		const promsie = startRepl(suitestInstance);

		assert.strictEqual(isActive(), true, 'repl is active');
		assert.strictEqual(repl.start.called, true, 'repl start called');
		assert.strictEqual(promsie instanceof Promise, true, 'promise returned');
	});
});
