const assert = require('assert');
const repl = require('repl');
const {startRepl} = require('../../lib/testLauncher/repl');

describe('repl', () => {
	it('should test startRepl', async() => {
		const suitestInstance = {};
		const promise = startRepl(suitestInstance);

		assert.strictEqual(typeof suitestInstance.resume, 'function', 'resume method added');
		assert.strictEqual(repl.start.called, true, 'repl start called');

		setTimeout(suitestInstance.resume);
		await promise;

		assert.strictEqual(suitestInstance.resume, undefined, 'resume method deleted');
	});
});
