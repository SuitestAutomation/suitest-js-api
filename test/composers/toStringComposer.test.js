const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {makeToStringComposer} = require('../../lib/composers');

describe('toString Composer', () => {
	it('should provide .toString method', () => {
		const data = {};
		const chain = {};
		const toJSON = sinon.spy();

		Object.defineProperties(chain, makeToStringComposer(toJSON)(suitest, data, chain));

		assert.strictEqual(typeof chain.toString, 'function');

		const toStringDescriptor = Object.getOwnPropertyDescriptor(chain, 'toString');

		assert.strictEqual(toStringDescriptor.enumerable, true);
		assert.strictEqual(toStringDescriptor.writable, false);
		assert.strictEqual(toStringDescriptor.configurable, false);
	});
});
