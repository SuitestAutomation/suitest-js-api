const assert = require('assert');
const sinon = require('sinon');
const SuitestLauncher = require('../../lib/testLauncher/SuitestLauncher');
const {handler} = require('../../lib/testLauncher/commands/run');
const logger = require('../../index').logger;

describe('test launcher run command', function() {
	before(async() => {
		sinon.stub(logger, 'log');
	});

	after(async() => {
		logger.log.restore();
	});

	it('"run" command should start', async() => {
		const interactiveStub = sinon.stub(SuitestLauncher.prototype, 'runTokenSession');

		try {
			await handler({
				tokenId: 'id',
				tokenPassword: 'pass',
			});
			assert.strictEqual(interactiveStub.called, true);
		} finally {
			interactiveStub.restore();
		}
	});
});
