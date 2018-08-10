const assert = require('assert');
const sinon = require('sinon');

const SuitestLauncher = require('../../lib/testLauncher/SuitestLauncher');
const {handler} = require('../../lib/testLauncher/commands/interactive');
const {promptPassword} = require('../../lib/utils/testLauncherHelper');
const logger = require('../../lib/utils/logger');

describe('test launcher interactive command', function() {
	before(async() => {
		sinon.stub(logger, 'log');
	});

	after(async() => {
		logger.log.restore();
	});

	it('"interactive" command should and start interactive process', async() => {
		const interactiveStub = sinon.stub(SuitestLauncher.prototype, 'runInteractiveSession');

		await handler({
			password: 'pass',
		});

		assert.strictEqual(interactiveStub.called, true);

		interactiveStub.restore();
	});

	it('"interactive" command should ask user password and start interactive process', async() => {
		const interactiveStub = sinon.stub(SuitestLauncher.prototype, 'runInteractiveSession');

		await handler({});

		assert.strictEqual(promptPassword.called, true);
		assert.strictEqual(interactiveStub.called, true);

		interactiveStub.restore();
	});
});
