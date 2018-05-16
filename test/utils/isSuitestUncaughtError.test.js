const assert = require('assert');
const isSuitestUncaughtError = require('../../lib/utils/sentry/isSuitestUncaughtError');
const {API_CONSTRUCTOR_NAME, API_LIB_PATH_IDENTIFIERS, ASSERTION_ERROR_TYPE} = require('../../lib/constants');
const SuitestError = require('../../lib/utils/SuitestError');

describe('isSuitestUncaughtError util', () => {
	it('should check non SuitestError with no footprints in stacktrace', () => {
		assert.strictEqual(isSuitestUncaughtError({
			type: 'TypeError',
			stacktrace: {
				frames: [{filename: 'someFunctionName'}],
			},
		}), false, 'false');
	});

	it('should check non SuitestError with some footprints in stacktrace', () => {
		assert.strictEqual(isSuitestUncaughtError({
			type: 'TypeError',
			stacktrace: {
				frames: [{filename: API_CONSTRUCTOR_NAME + '.openSession'}],
			},
		}), true, 'true');
		assert.strictEqual(isSuitestUncaughtError({
			type: 'TypeError',
			stacktrace: {
				frames: [{filename: API_LIB_PATH_IDENTIFIERS[2]}],
			},
		}), true, 'true');
	});

	it('should check SuitestError', () => {
		assert.strictEqual(isSuitestUncaughtError({
			type: SuitestError.type,
			stacktrace: {
				frames: [],
			},
		}), false, 'false');
	});

	it('should check AssertionError', () => {
		assert.strictEqual(isSuitestUncaughtError({
			type: ASSERTION_ERROR_TYPE,
			stacktrace: {
				frames: [],
			},
		}), false, 'false');
	});
});
