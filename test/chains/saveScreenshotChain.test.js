const assert = require('assert');
const path = require('path');
const sinon = require('sinon');
const suitest = require('../../index');
const {
	saveScreenshot,
	getComposers,
	toJSON,
	processFilePath,
	getPlaceholdersValues,
} = require('../../lib/chains/saveScreenshotChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
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

	describe('testing saveScreenshot with different arguments', () => {
		it('should accept not empty string', () => {
			assert.doesNotThrow(() => saveScreenshot('/path/to/file.png'));
			assert.doesNotThrow(() => saveScreenshot('C:\\path\\to\\file.png'));
			assert.doesNotThrow(() => saveScreenshot());
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

	describe('testing helper functions for processing file path', () => {
		let clock;
		const formattedDateTime = '2020-01-12-13-31-12-444';

		before(() => {
			clock = sinon.useFakeTimers(new Date('01 12 2020 13:31:12:444'));
		});

		it('processFilePath function', () => {
			assert.deepStrictEqual(
				processFilePath('test.png'),
				'test.png',
				'should return original path if it is does not contains placeholders',
			);
			assert.deepStrictEqual(
				processFilePath('{dateTime}'),
				formattedDateTime,
				'should replace "{dateTime}" placeholder',
			);
			assert.deepStrictEqual(
				processFilePath('{screenshotDir}'),
				path.resolve(process.cwd(), 'screenshots'),
				'should replace "{screenshotDir}" placeholder',
			);
			assert.deepStrictEqual(
				processFilePath('{currentFile}'),
				'saveScreenshotChain.test.js',
				'should replace "{currentFile}" placeholder',
			);
			assert.deepStrictEqual(
				processFilePath('{currentLine}'),
				'88',
				'should replace "{currentLine}" placeholder',
			);
			assert.deepStrictEqual(
				processFilePath(path.join('{screenshotDir}', '{dateTime}_{currentFile}_l{currentLine}.png')),
				path.join(
					process.cwd(),
					'screenshots',
					formattedDateTime + '_saveScreenshotChain.test.js_l93.png',
				),
				'should replace several placeholders',
			);
		});

		it('getPlaceholdersValues function', () => {
			const placeholderValues = getPlaceholdersValues();

			assert.strictEqual(placeholderValues.dateTime, formattedDateTime);
			assert.strictEqual(placeholderValues.screenshotDir, path.join(process.cwd(), 'screenshots'));
			assert.strictEqual(typeof placeholderValues.currentFile, 'string');
			assert.ok(placeholderValues.currentLine > 0, 'current line should be greeter then 0');
		});

		after(() => {
			clock.restore();
		});
	});
});
