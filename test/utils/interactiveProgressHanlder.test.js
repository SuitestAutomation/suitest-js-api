const assert = require('assert');
const sinon = require('sinon');
const logger = require('../../lib/utils/logger');
const texts = require('../../lib/texts');
const {getProgressExplanation, handleProgress} = require('../../lib/utils/interactiveProgressHanlder');

describe('interactiveProgressHanlder util', () => {
	it('should get correct description text', () => {
		assert.strictEqual(getProgressExplanation(''), undefined, 'empty string');
		assert.strictEqual(getProgressExplanation('nothing'), undefined, 'nothing');
		assert.strictEqual(getProgressExplanation('notDefinedStatus'), undefined, 'not defined status');
		assert.strictEqual(
			getProgressExplanation('openingApp'),
			texts['interactiveProgress.status.openingApp'](),
			'ok status',
		);
		assert.strictEqual(getProgressExplanation('actionFailed'), undefined, 'no code');
		assert.strictEqual(getProgressExplanation('actionFailed', 'wrondCode'), undefined, 'wrong code');
		assert.strictEqual(
			getProgressExplanation('actionFailed', 'blasterError'),
			texts['interactiveProgress.code.blasterError'](),
			'ok code',
		);
	});

	it('should handleProgress', () => {
		sinon.stub(logger, 'log');

		try {
			handleProgress('');
			assert(!logger.log.called);
			handleProgress('recoveringID');
			assert(logger.log.called);
		} finally {
			logger.log.restore();
		}
	});
});
