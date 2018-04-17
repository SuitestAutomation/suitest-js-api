const assert = require('assert');
const sinon = require('sinon');
const {
	registerLeaf,
	unregisterLeaf,
	getUnusedLeaves,
	warnUnusedLeaves,
	clearPool,
} = require('../../lib/utils/unusedExpressionWatchers');

describe('unusedExpressionWatchers', () => {
	beforeEach(() => {
		clearPool();
	});

	it('should add object to pool', () => {
		const chain = {};

		registerLeaf(chain);

		assert.deepStrictEqual(getUnusedLeaves(), [chain]);
	});

	it('should remove object from pool', () => {
		const chain = {};

		registerLeaf(chain);
		unregisterLeaf(chain);

		assert.deepStrictEqual(getUnusedLeaves(), []);
	});

	it('should display warning to user about unused chains', () => {
		const chain = {};

		registerLeaf(chain);

		sinon.stub(console, 'warn');

		warnUnusedLeaves();

		try {
			assert(console.warn.called);
		} finally {
			console.warn.restore();
		}
	});

	it('should not display warning if there are no unused chains', () => {
		sinon.stub(console, 'warn');

		warnUnusedLeaves();

		try {
			assert(!console.warn.called);
		} finally {
			console.warn.restore();
		}
	});
});
