const assert = require('assert');
const sinon = require('sinon');

const interactive = require('../../lib/commands/interactive');
const {config, extend} = require('../../config');
const logger = require('../../lib/utils/logger');
const {startRepl} = require('../../lib/testLauncher/repl');

describe('interactive command', () => {
	it('should display warning if .interactive() command not allowed', async() => {
		repl = config.repl;
		extend({repl: false});
		let result = true;

		sinon.stub(logger, 'info');
		const warnStub = sinon.stub(logger, 'warn');

		try {
			result = await interactive();
		} finally {
			logger.info.restore();
			warnStub.restore();
			extend({repl});
		}

		assert.strictEqual(result, undefined, 'promise resolved');
		assert.strictEqual(startRepl.called, false, 'repl not called');
		assert.strictEqual(warnStub.called, true, 'warning displayed');
	});

	it('should start repl', async() => {
		repl = config.repl;
		extend({repl: true});
		let result = true;

		sinon.stub(logger, 'info');
		const warnStub = sinon.stub(logger, 'warn');

		try {
			result = await interactive();
		} finally {
			logger.info.restore();
			warnStub.restore();
			extend({repl});
		}

		assert.strictEqual(result, undefined, 'promise resolved');
		assert.strictEqual(startRepl.called, true, 'repl called');
		assert.strictEqual(warnStub.called, false, 'warning not displayed');
	});
});
