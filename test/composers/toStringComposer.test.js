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

	it('should call underlying callback and return the result', () => {
		const data = {};
		const json = {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'element',
						apiId: 'apiId',
					},
					type: '!exists',
				},
				timeout: 2000,
			},
		};
		const chain = {};
		const callback = sinon.spy(() => json);

		Object.defineProperties(chain, makeToStringComposer(callback)(suitest, data, chain));

		// just check that string returned for avoid test failing if @suitest/translate will update translations
		assert.deepStrictEqual(typeof chain.toString(), 'string');
	});
});
