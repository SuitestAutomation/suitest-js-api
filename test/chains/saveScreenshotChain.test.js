const assert = require('assert');
const suitest = require('../../index');
const {
	saveScreenshot,
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/saveScreenshotChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const SuitestError = require('../../lib/utils/SuitestError');

describe('Save screenshot chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
			composers.ABANDON,
		].sort(bySymbol), 'saveScreenshot methods');

		assert.deepStrictEqual(getComposerTypes(getComposers({isAbandoned: true})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned saveScreenshot chain');
	});

	it('should generate correct socket message for saveScreenshot chain', () => {
		assert.deepStrictEqual(toJSON(), {type: 'takeScreenshot'});
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString(), 'Saving screenshot');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');

		assertBeforeSendMsg(beforeSendMsg, log, undefined, 'Launcher E Saving screenshot');
		log.restore();
	});

	describe('testing saveScreenshot with different arguments', () => {
		it('should accept not empty string', () => {
			assert.doesNotThrow(() => saveScreenshot('/path/to/file.png'));
			assert.doesNotThrow(() => saveScreenshot('C:\\path\\to\\file.png'));
		});

		it('should throw error when passing invalid arguments', () => {
			function isSuitestErrorInvalidInput(err) {
				return err instanceof SuitestError &&
					err.code === SuitestError.INVALID_INPUT &&
					err.message.includes('Invalid input provided for .saveScreenshot function');
			}
			assert.throws(() => saveScreenshot(''), isSuitestErrorInvalidInput);
			assert.throws(() => saveScreenshot(null), isSuitestErrorInvalidInput);
			assert.throws(() => saveScreenshot([]), isSuitestErrorInvalidInput);
			assert.throws(() => saveScreenshot(() => void 0), isSuitestErrorInvalidInput);
			assert.throws(() => saveScreenshot(111), isSuitestErrorInvalidInput);
			assert.throws(() => saveScreenshot(Symbol('any')), isSuitestErrorInvalidInput);
		});
	});
});
