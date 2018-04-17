const assert = require('assert');
const isSuitestUncaughtError = require('../../lib/utils/sentry/isSuitestUncaughtError');

it('should check non SuitestError with no footprints in stacktrace', () => {
	assert.strictEqual(isSuitestUncaughtError({
		type: 'TypeError',
		stacktrace: {
			frames: [{function: 'someFunctionName'}],
		},
	}), false, 'false');
});

it('should check non SuitestError with some footprints in stacktrace', () => {
	assert.strictEqual(isSuitestUncaughtError({
		type: 'TypeError',
		stacktrace: {
			frames: [{function: 'SUITEST_API.openSession'}],
		},
	}), true, 'true');
});

it('should check SuitestError', () => {
	assert.strictEqual(isSuitestUncaughtError({
		type: 'SuitestError',
		stacktrace: {
			frames: [],
		},
	}), false, 'false');
});
