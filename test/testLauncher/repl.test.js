const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');
const EventEmitter = require('events');

// mock repl instance
class ReplInstance extends EventEmitter {
	constructor() {
		super();
		this.context = {};
		setTimeout(() => this.emit('exit'), 50);
		this.close = () => void 0;
	}
}

describe('repl', () => {
	before(() => {
		sinon.stub(repl, 'start').returns(new ReplInstance());
		require('../../lib/utils/testHelpers/mocks').restoreRepl();
	});

	after(() => {
		repl.start.restore();
		require('../../lib/utils/testHelpers/mocks').stubRepl();
	});

	it('should test startRepl', async() => {
		const {startRepl, isActive} = require('../../lib/testLauncher/repl');
		const suitestInstance = {};
		const promsie = startRepl(suitestInstance);

		assert.strictEqual(isActive(), true, 'repl is active');
		assert.strictEqual(repl.start.called, true, 'repl start called');
		assert.strictEqual(promsie instanceof Promise, true, 'promise returned');
		await promsie;
		assert.strictEqual(isActive(), false, 'repl is back to inactive');
	});
});
