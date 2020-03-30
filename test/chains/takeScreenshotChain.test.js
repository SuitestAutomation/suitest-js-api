const assert = require('assert');
const {
	takeScreenshot,
	getComposers,
	toString,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/takeScreenshotChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const sinon = require('sinon');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');
const SuitestError = require('../../lib/utils/SuitestError');

describe('Take screenshot chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
			composers.ABANDON,
		].sort(bySymbol), 'takeScreenshot methods');

		assert.deepStrictEqual(getComposerTypes(getComposers({isAbandoned: true})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned takeScreenshot chain');
	});

	it('should generate correct socket message for takeScreenshot chain', () => {
		assert.deepStrictEqual(toJSON(), {type: 'takeScreenshot'});
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString(), 'Take screenshot');
	});

	it('should have beforeSendMsg', () => {
		const log = sinon.stub(console, 'log');

		assertBeforeSendMsg(beforeSendMsg, log, undefined, 'Launcher E Take screenshot');
		log.restore();
	});

	describe('testing takeScreenshot with different arguments', () => {
		it('should handle not empty string or undefined', () => {
			assert.doesNotThrow(() => takeScreenshot('raw'));
			assert.doesNotThrow(() => takeScreenshot('base64'));
		});

		it('should throw error when passing invalid arguments', () => {
			function isSuitestErrorInvalidInput(err) {
				return err instanceof SuitestError &&
					err.code === SuitestError.INVALID_INPUT &&
					err.message.includes('Invalid input provided for .takeScreenshot function');
			}
			assert.throws(() => takeScreenshot(''), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot('any/path/image.png'), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot(null), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot([]), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot(() => void 0), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot(111), isSuitestErrorInvalidInput);
			assert.throws(() => takeScreenshot(Symbol('any')), isSuitestErrorInvalidInput);
		});
	});
});
