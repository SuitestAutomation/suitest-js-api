const assert = require('assert');
const repl = require('repl');
const sinon = require('sinon');
const EventEmitter = require('events');

let context;
let evalStub;
let defineCommandStub;

// mock repl instance
class ReplInstance extends EventEmitter {
	constructor() {
		super();
		this.context = context = {};
		setTimeout(() => this.emit('exit'), 50);
		this.close = sinon.stub();
		this.eval = evalStub = sinon.stub();
		this.defineCommand = defineCommandStub = sinon.stub();
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
		const testContext = {suitest: 'suitest'};
		const promsie = startRepl({context: testContext});

		assert.strictEqual(isActive(), true, 'repl is active');
		assert.strictEqual(repl.start.called, true, 'repl start called');
		assert.strictEqual(evalStub.called, true, 'replInstance eval called');
		assert.strictEqual(defineCommandStub.lastCall.args[0], 'r', '.r command defined');
		assert.deepEqual(context, testContext, 'replInstance context extended');
		assert.strictEqual(promsie instanceof Promise, true, 'promise returned');
		await promsie;
		assert.strictEqual(isActive(), false, 'repl is back to inactive');
	});

	it('should test upgradeEval', async() => {
		const {upgradeEval} = require('../../lib/testLauncher/repl');

		const eval = sinon.stub();
		const upgrader = sinon.stub();
		const replInstance = {eval};

		upgradeEval(replInstance, upgrader);
		replInstance.eval('test');

		assert.strictEqual(upgrader.called, true, 'upgrader called');
		assert.strictEqual(upgrader.lastCall.args[0], 'test', 'upgrader args');
		assert.strictEqual(eval.called, true, 'eval called');
		assert.strictEqual(eval.lastCall.args[0], 'test', 'eval args');
	});
});
