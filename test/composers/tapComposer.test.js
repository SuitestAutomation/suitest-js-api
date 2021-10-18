const assert = require('assert');
const sinon = require('sinon');
const {tapComposer} = require('../../lib/composers');
const SuitestError = require('../../lib/utils/SuitestError');
const suitest = require('../../index');

describe('Tap composer', () => {
	it('should define tap method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'tap');

		assert.strictEqual(typeof chain.tap, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set tap property when object converts to click', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		chain.tap('single');

		assert.deepStrictEqual(makeChain.firstCall.args[0], {tap: 'single'});
	});

	it('should process tap without arguments', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		chain.tap();

		assert.deepStrictEqual(makeChain.firstCall.args[0], {tap: 'single'});
	});

	it('should set "long" tap type with duration', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		chain.tap('long', 2000);
		assert.deepStrictEqual(
			makeChain.firstCall.args[0],
			{
				tap: 'long',
				tapDuration: 2000,
			},
		);
	});

	it('should throw errors when tap called with wrong arguments', () => {
		function isSuitestErrorInvalidInput(message) {
			return err => err instanceof SuitestError &&
				err.code === SuitestError.INVALID_INPUT &&
				err.message.includes(message);
		}
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, tapComposer(suitest, data, chain, makeChain));

		assert.throws(
			() => chain.tap('single', 2000),
			isSuitestErrorInvalidInput('Invalid input provided for .tap function.' +
				' Second argument (duration) can be specified for "long" tap type only'));
		assert.throws(
			() => chain.tap('long', '2000'),
			isSuitestErrorInvalidInput('Invalid input provided for .tap function.' +
				' Second argument (duration) should be suitest configuration variable'),
		);
	});
});
