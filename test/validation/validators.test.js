const assert = require('assert');
const {
	validatePositiveNumber,
	validateNonEmptyStringOrUndefined,
	validateStVarOrPositiveNumber,
} = require('../../lib/validation/validators');
const {validate, validators} = require('../../lib/validation');
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

	it('should validate vars or positive number', () => {
		assert.strictEqual(validateStVarOrPositiveNumber(0), 0);
		assert.strictEqual(validateStVarOrPositiveNumber(1), 1);
		assert.strictEqual(validateStVarOrPositiveNumber('<%any var%>'), '<%any var%>');
		assert.throws(() => validateStVarOrPositiveNumber(-1), /Error/);
		assert.throws(() => validateStVarOrPositiveNumber(''), /Error/);
		assert.throws(() => validateStVarOrPositiveNumber(null), /Error/);
		assert.throws(() => validateStVarOrPositiveNumber(NaN), /Error/);
		assert.throws(() => validateStVarOrPositiveNumber('10'), /Error/);
	});

	it('should validate non empty string or undefined', () => {
		assert.strictEqual(validateNonEmptyStringOrUndefined(undefined), undefined);
		assert.strictEqual(validateNonEmptyStringOrUndefined('string'), 'string');
		assert.throws(() => validateNonEmptyStringOrUndefined(''), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined(null), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined(1), /Error/);
		assert.throws(() => validateNonEmptyStringOrUndefined({}), /Error/);
	});

	it('should throw correct error message', () => {
		testInputErrorSync(validate, [validators.CONFIGURE, {disallowCrashReports: 'false'}], {
			message: 'Invalid input \'disallowCrashReports\' should be boolean.',
		}, 'invalid configuration object');
	});

	it('should validate configOverride', () => {
		testInputErrorSync(validate, [validators.CONFIG_OVERRIDE, {
			configVariables: [{
				value: 'string',
				name: 'string',
			}],
		}], {
			message: 'Invalid input should have required property \'key\'',
		}, 'invalid configOverride object');
	});
});
