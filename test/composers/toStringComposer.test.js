const assert = require('assert');
const sinon = require('sinon');
const {identity} = require('ramda');
const {makeToStringComposer} = require('../../lib/composers');

describe('toString Composer', () => {
	it('should provide .toString method', () => {
		const data = {};
		const chain = {};
		const toString = sinon.spy();
		const toJSON = sinon.spy();

		Object.defineProperties(chain, makeToStringComposer(toString, toJSON)(data, chain));

		assert.strictEqual(typeof chain.toString, 'function');

		const toStringDescriptor = Object.getOwnPropertyDescriptor(chain, 'toString');

		assert.strictEqual(toStringDescriptor.enumerable, true);
		assert.strictEqual(toStringDescriptor.writable, false);
		assert.strictEqual(toStringDescriptor.configurable, false);
	});

	it('should generate a new chain with comparator defined', () => {
		const data = {test: 0};
		const chain = {};
		const toString = sinon.spy(identity);
		const toJSON = sinon.spy(identity);

		Object.defineProperties(chain, makeToStringComposer(toString, toJSON)(data, chain));

		chain.toString();

		assert.deepStrictEqual(toString.firstCall.args[0], {test: 0});
		assert.deepStrictEqual(toJSON.firstCall.args[0], {test: 0});
	});

	describe('should pass correct json to the toString method for:', () => {
		it('"query" message', () => {
			const chain = {};
			const toJSON = sinon.spy(() => ({
				type: 'query',
				testingData: true,
			}));
			const toString = sinon.spy();

			Object.defineProperties(chain, makeToStringComposer(toString, toJSON)({}, chain));
			chain.toString();

			assert.deepStrictEqual(toString.firstCall.args[0], {
				type: 'query',
				testingData: true,
			});
		});

		it('"eval" message', () => {
			const chain = {};
			const toJSON = sinon.spy(() => ({
				type: 'eval',
				request: {testingData: true},
			}));
			const toString = sinon.spy();

			Object.defineProperties(chain, makeToStringComposer(toString, toJSON)({}, chain));
			chain.toString();

			assert.deepStrictEqual(toString.firstCall.args[0], {testingData: true});
		});

		it('"eval" message', () => {
			const chain = {};
			const toJSON = sinon.spy(() => ({
				type: 'testLine',
				request: {testingData: true},
			}));
			const toString = sinon.spy();

			Object.defineProperties(chain, makeToStringComposer(toString, toJSON)({}, chain));
			chain.toString();

			assert.deepStrictEqual(toString.firstCall.args[0], {testingData: true});
		});
	});
});
