const assert = require('assert');
const {
	validatePositiveNumber,
	validateNonEmptyStringOrUndefined,
	validateArrayOfSymbols,
} = require('../../lib/validataion/validators');
const {validate, validators} = require('../../lib/validataion');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('validators', () => {
	it('should validate positive number', () => {
		assert.strictEqual(validatePositiveNumber(0), 0);
		assert.strictEqual(validatePositiveNumber(1), 1);
		assert.throws(() => validatePositiveNumber(-1), /Error/);
		assert.throws(() => validatePositiveNumber(''), /Error/);
		assert.throws(() => validatePositiveNumber(null), /Error/);
		assert.throws(() => validatePositiveNumber(NaN), /Error/);
	});

	it('should validate non empty string or undefined', () => {
		assert.strictEqual(validateNonEmptyStringOrUndefined(undefined), undefined);
		assert.strictEqual(validateNonEmptyStringOrUndefined('string'), 'string');
		assert.throws(() => validateNonEmptyStringOrUndefined(''), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined(null), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined(1), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined({}), /Error/);
	});

	it('should validate array of symbols', () => {
		assert.ok(validateArrayOfSymbols([Symbol(1)]));
		assert.ok(validateArrayOfSymbols([Symbol(1), Symbol(2)]));
		assert.throws(() => validateArrayOfSymbols(Symbol(1)), /Error/);
		assert.throws(() => validateArrayOfSymbols([1, 2]), /Error/);
	});

	it('should validate array of symbols', () => {
		assert.ok(validateArrayOfSymbols([Symbol(1)]));
		assert.ok(validateArrayOfSymbols([Symbol(1), Symbol(2)]));
		assert.throws(() => validateArrayOfSymbols(Symbol(1)), /Error/);
		assert.throws(() => validateArrayOfSymbols([1, 2]), /Error/);
	});

	it('should throw correct error message', () => {
		testInputErrorSync(validate, [validators.CONFIGURE, {disallowCrashReports: 'false'}], {
			message: 'Invalid input \'disallowCrashReports\' should be boolean.',
		}, 'invalid configuration object');
	});
});
