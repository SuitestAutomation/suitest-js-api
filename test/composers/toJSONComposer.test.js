const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {makeToJSONComposer} = require('../../lib/composers');

describe('toJSON Composer', () => {
	it('should provide .toJSON method', () => {
		const data = {};
		const chain = {};
		const callback = sinon.spy();

		Object.defineProperties(chain, makeToJSONComposer(callback)(suitest, data, chain));

		assert.strictEqual(typeof chain.toJSON, 'function');

		const toStringDescriptor = Object.getOwnPropertyDescriptor(chain, 'toJSON');

		assert.strictEqual(toStringDescriptor.enumerable, true);
		assert.strictEqual(toStringDescriptor.writable, false);
		assert.strictEqual(toStringDescriptor.configurable, false);
	});

	it('should call underlying callback and return the result', () => {
		const data = {test: 0};
		const json = {test: 1};
		const chain = {};
		const callback = sinon.spy(() => json);

		Object.defineProperties(chain, makeToJSONComposer(callback)(suitest, data, chain));

		const res = chain.toJSON();

		assert.deepStrictEqual(callback.firstCall.args[0], {test: 0});
		assert.deepStrictEqual(res, json);
	});
});
