const assert = require('assert');
const sinon = require('sinon');
const {
	makeMethodComposer,
	makeModifierComposer,
} = require('../../lib/utils/makeComposer');

const DUMMY_COMPOSER = Symbol('dummyComposer');

describe('makeMethodComposer util', () => {
	it('should generate composer with provided names and callback', () => {
		const data = {test: 0};
		const callback = sinon.spy();
		const chain = {};

		const composer = makeMethodComposer(DUMMY_COMPOSER, ['test1', 'test2'], callback);

		Object.defineProperties(chain, composer(data));

		assert.strictEqual(typeof chain.test1, 'function');
		assert.strictEqual(typeof chain.test2, 'function');

		const test1Descriptor = Object.getOwnPropertyDescriptor(chain, 'test1');

		assert.strictEqual(test1Descriptor.configurable, false);
		assert.strictEqual(test1Descriptor.writable, false);
		assert.strictEqual(test1Descriptor.enumerable, true);

		const test2Descriptor = Object.getOwnPropertyDescriptor(chain, 'test2');

		assert.strictEqual(test2Descriptor.configurable, false);
		assert.strictEqual(test2Descriptor.writable, false);
		assert.strictEqual(test2Descriptor.enumerable, true);
	});

	it('should allow changing property descriptors', () => {
		const chain = {};

		Object.defineProperties(chain, makeMethodComposer(DUMMY_COMPOSER, ['test1'], x => x, {
			configurable: true,
			writable: true,
			enumerable: false,
		})({}));

		const test1Descriptor = Object.getOwnPropertyDescriptor(chain, 'test1');

		assert.strictEqual(test1Descriptor.configurable, true);
		assert.strictEqual(test1Descriptor.writable, true);
		assert.strictEqual(test1Descriptor.enumerable, false);
	});

	it('should call provided callback with data as first argument followed by passed args', () => {
		const data = {test: 0};
		const callback = sinon.spy();
		const chain = {};

		const composer = makeMethodComposer(DUMMY_COMPOSER, ['test'], callback);

		Object.defineProperties(chain, composer(data));

		chain.test('testArgument');

		assert(callback.calledWith(data, 'testArgument'));
		assert(callback.calledOn(undefined));
	});
});

describe('makeModifierComposer util', () => {
	it('should generate composer with provided names and callback', () => {
		const data = {test: 0};
		const callback = sinon.spy();
		const chain = {};

		const composer = makeModifierComposer(DUMMY_COMPOSER, ['test1', 'test2'], callback);

		Object.defineProperties(chain, composer(data));

		assert.strictEqual(typeof chain.test1, 'function');
		assert.strictEqual(typeof chain.test2, 'function');

		const test1Descriptor = Object.getOwnPropertyDescriptor(chain, 'test1');

		assert.strictEqual(test1Descriptor.configurable, false);
		assert.strictEqual(test1Descriptor.writable, false);
		assert.strictEqual(test1Descriptor.enumerable, true);

		const test2Descriptor = Object.getOwnPropertyDescriptor(chain, 'test2');

		assert.strictEqual(test2Descriptor.configurable, false);
		assert.strictEqual(test2Descriptor.writable, false);
		assert.strictEqual(test2Descriptor.enumerable, true);
	});

	it('should allow changing property descriptors', () => {
		const chain = {};

		Object.defineProperties(chain, makeModifierComposer(DUMMY_COMPOSER, ['test1'], x => x, {
			configurable: true,
			writable: true,
			enumerable: false,
		})({}));

		const test1Descriptor = Object.getOwnPropertyDescriptor(chain, 'test1');

		assert.strictEqual(test1Descriptor.configurable, true);
		assert.strictEqual(test1Descriptor.writable, true);
		assert.strictEqual(test1Descriptor.enumerable, false);
	});

	it('should call provided callback with data as first argument followed by passed args', () => {
		const data = {test: 0};
		const data2 = {test: 1}
		const callback = sinon.spy(() => data2);
		const chain = {};
		const makeChain = sinon.spy(() => 'I am new chain');

		const composer = makeModifierComposer(DUMMY_COMPOSER, ['test'], callback);

		Object.defineProperties(chain, composer(data, chain, makeChain));

		const res = chain.test('testArgument');

		assert.strictEqual(res, 'I am new chain');
		assert(callback.calledWith(data, 'testArgument'));
		assert(callback.calledOn(undefined));
		assert(makeChain.calledWith(data2));
		assert(makeChain.calledOn(undefined));
	});
});
