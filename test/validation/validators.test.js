const assert = require('assert');
const {
	validateNotNegativeNumber,
	validateNumber,
	validateNonEmptyStringOrUndefined,
	validateStVarOrPositiveNumber,
	validateStVarOrNumber,
	validateStVarOrPositiveNumberNotZero,
	validateStVarMsDuration,
} = require('../../lib/validation/validators');
const {validate, validators} = require('../../lib/validation');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('validators', () => {
	it('should validate positive number', () => {
		assert.strictEqual(validateNotNegativeNumber(0), 0);
		assert.strictEqual(validateNotNegativeNumber(1), 1);
		assert.throws(() => validateNotNegativeNumber(-1), /Error/);
		assert.throws(() => validateNotNegativeNumber(''), /Error/);
		assert.throws(() => validateNotNegativeNumber(null), /Error/);
		assert.throws(() => validateNotNegativeNumber(NaN), /Error/);
	});

	it('should validate number', () => {
		assert.strictEqual(validateNumber(0), 0);
		assert.strictEqual(validateNumber(1), 1);
		assert.strictEqual(validateNumber(-1), -1);
		assert.throws(
			() => validateNumber('', 'someNumber'),
			/SuitestError: Invalid input someNumber should be number/,
		);
		assert.throws(
			() => validateNumber(null, 'someNumber'),
			/SuitestError: Invalid input someNumber should be number/,
		);
		assert.throws(
			() => validateNumber(NaN, 'someNumber'),
			/SuitestError: Invalid input someNumber should be number/,
		);
		assert.throws(
			() => validateNumber(Infinity, 'someNumber'),
			/SuitestError: Invalid input someNumber should be number/,
		);
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
	it('should validate vars or positive number, but not zero', () => {
		assert.strictEqual(validateStVarOrPositiveNumberNotZero(1), 1);
		assert.strictEqual(validateStVarOrPositiveNumberNotZero('<%any var%>'), '<%any var%>');
		assert.throws(() => validateStVarOrPositiveNumberNotZero(0), /Error/);
		assert.throws(() => validateStVarOrPositiveNumberNotZero(-1), /Error/);
		assert.throws(() => validateStVarOrPositiveNumberNotZero(''), /Error/);
		assert.throws(() => validateStVarOrPositiveNumberNotZero(null), /Error/);
		assert.throws(() => validateStVarOrPositiveNumberNotZero(NaN), /Error/);
		assert.throws(() => validateStVarOrPositiveNumberNotZero('10'), /Error/);
	});
	it('should validate vars or number', () => {
		assert.strictEqual(validateStVarOrNumber(0), 0);
		assert.strictEqual(validateStVarOrNumber(1), 1);
		assert.strictEqual(validateStVarOrNumber('<%any var%>'), '<%any var%>');
		assert.strictEqual(validateStVarOrNumber(-1), -1);

		assert.throws(
			() => validateStVarOrNumber('', 'someNumber'),
			/SuitestError: Invalid input someNumber should be suitest configuration variable/)
		;
		assert.throws(
			() => validateStVarOrNumber(null, 'someNumber'),
			/SuitestError: Invalid input someNumber should be suitest configuration variable/,
		);
		assert.throws(
			() => validateStVarOrNumber(NaN, 'someNumber'),
			/SuitestError: Invalid input someNumber should be number/,
		);
		assert.throws(
			() => validateStVarOrNumber('10', 'someNumber'),
			/SuitestError: Invalid input someNumber should be suitest configuration variable/,
		);
	});

	it('should validate vars or max ms time', () => {
		assert.strictEqual(validateStVarMsDuration(300), 300);
		assert.throws(() => validateStVarMsDuration(400000), /Error/);
		assert.throws(
			() => validateStVarMsDuration(400000, 'someNumber'),
			'SuitestError: Invalid input someNumber maximum duration (30s) exceeded',
		);
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
			message: 'Invalid input .configVariables[0] should have required property \'key\'',
		}, 'invalid configOverride object');
	});

	it('should validate configuration presets', () => {
		const baseArg = {
			tokenId: '1',
			tokenPassword: '1',
			preset: ['preset1'],
		};

		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {config: false, device: null},
					},
				},
			),
			/^SuitestError: Invalid input/,
			'Should validate preset config and device',
		);
		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {},
					},
				},
			),
			/SuitestError: Invalid input .presets\['preset1'] should have required property 'device'/,
		);
		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {config: 'config-id', device: undefined},
					},
				},
			),
			/SuitestError: Invalid input .presets\['preset1'] should have required property 'device'/,
		);
		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {config: undefined, device: 'device-id'},
					},
				},
			),
			/SuitestError: Invalid input .presets\['preset1'] should have required property 'config'/,
		);
		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {
							config: {
								configId: false,
							},
							device: {
								deviceId: 123,
							},
						},
					},
				},
			),
			/^SuitestError: Invalid input/,
			'Should validate preset config.configId and device.deviceId',
		);
		assert.throws(
			() => validate(
				validators.TEST_LAUNCHER_TOKEN,
				{
					...baseArg,
					presets: {
						preset1: {
							config: {
								configId: 'config-id1',
								notAllowedProp: 'some val',
							},
							device: {
								deviceId: 'device-id1',
								anotherNotAllowedProp: 'some val',
							},
						},
					},
				},
			),
			/^SuitestError: Invalid input/,
			'Should not additional fields to preset config and device if they are objects',
		);
	});
});
