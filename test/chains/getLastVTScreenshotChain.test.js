const assert = require('assert');
const suitest = require('../../index');
const {
	getLastVTScreenshot,
	getComposers,
	toJSON,
} = require('../../lib/chains/getLastVTScreenshotChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const SuitestError = require('../../lib/utils/SuitestError');

describe('Get last visual testing screenshot chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
			composers.ABANDON,
		].sort(bySymbol), 'getLastVTScreenshot methods');

		assert.deepStrictEqual(getComposerTypes(getComposers({isAbandoned: true})), [
			composers.TO_STRING,
			composers.THEN,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned getLastVTScreenshot chain');
	});

	it('should generate correct socket message for getLastVTScreenshot chain', () => {
		assert.deepStrictEqual(toJSON(), {type: 'lastScreenshot'});
	});

	describe('testing getLastVTScreenshotChain with different arguments', () => {
		it('should handle not empty string or undefined', () => {
			assert.doesNotThrow(() => getLastVTScreenshot('raw'));
			assert.doesNotThrow(() => getLastVTScreenshot('base64'));
		});

		it('should throw error when passing invalid arguments', () => {
			function isSuitestErrorInvalidInput(err) {
				return err instanceof SuitestError &&
					err.code === SuitestError.INVALID_INPUT &&
					err.message.includes('Invalid input provided for .getLastVTScreenshot function');
			}
			assert.throws(() => getLastVTScreenshot(''), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot('any/path/image.png'), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot(null), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot([]), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot(() => void 0), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot(111), isSuitestErrorInvalidInput);
			assert.throws(() => getLastVTScreenshot(Symbol('any')), isSuitestErrorInvalidInput);
		});
	});
});
