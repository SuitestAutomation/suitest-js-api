const assert = require('assert');
const sinon = require('sinon');
const {makeToStringComposer} = require('../../lib/composers');

describe('toString Composer', () => {
	it('should provide .toString method', () => {
		const data = {};
		const chain = {};
		const callback = sinon.spy();

		Object.defineProperties(chain, makeToStringComposer(callback)(data, chain));

		assert.strictEqual(typeof chain.toString, 'function');

		const toStringDescriptor = Object.getOwnPropertyDescriptor(chain, 'toString');

		assert.strictEqual(toStringDescriptor.enumerable, true);
		assert.strictEqual(toStringDescriptor.writable, false);
		assert.strictEqual(toStringDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {test: 0};
		const chain = {};
		const callback = sinon.spy();

		Object.defineProperties(chain, makeToStringComposer(callback)(data, chain));

		chain.toString();

		assert.deepStrictEqual(callback.firstCall.args[0], {test: 0});
	});
});
