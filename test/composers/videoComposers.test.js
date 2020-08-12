const assert = require('assert');
const sinon = require('sinon');
const suitest = require('../../index');
const {isPausedComposer, isStoppedComposer, isPlayingComposer} = require('../../lib/composers');

describe('Video composers', () => {
	it('should define isPaused method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isPausedComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'isPaused');

		assert.strictEqual(typeof chain.isPaused, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should define isPlaying method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isPlayingComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'isPlaying');

		assert.strictEqual(typeof chain.isPlaying, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should define isStopped method', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isStoppedComposer(suitest, data, chain, makeChain));

		const abandonPropertyDescriptor = Object.getOwnPropertyDescriptor(chain, 'isStopped');

		assert.strictEqual(typeof chain.isStopped, 'function', 'is a Function');
		assert.strictEqual(abandonPropertyDescriptor.configurable, false, 'not configurable');
		assert.strictEqual(abandonPropertyDescriptor.enumerable, true, 'enumerable');
		assert.strictEqual(abandonPropertyDescriptor.writable, false, 'not writable');
	});

	it('should set correct comparator when object converts to isStopped', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isStoppedComposer(suitest, data, chain, makeChain));

		chain.isStopped();

		assert.deepStrictEqual(makeChain.firstCall.args[0].comparator, {
			type: 'has',
			props: [{
				name: 'videoState',
				val: 'stopped',
				type: '=',
			}],
		});
	});

	it('should set correct comparator when object converts to isPlaying', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isPlayingComposer(suitest, data, chain, makeChain));

		chain.isPlaying();

		assert.deepStrictEqual(makeChain.firstCall.args[0].comparator, {
			type: 'has',
			props: [{
				name: 'videoState',
				val: 'playing',
				type: '=',
			}],
		});
	});

	it('should set correct comparator when object converts to isPaused', () => {
		const chain = {};
		const data = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, isPausedComposer(suitest, data, chain, makeChain));

		chain.isPaused();

		assert.deepStrictEqual(makeChain.firstCall.args[0].comparator, {
			type: 'has',
			props: [{
				name: 'videoState',
				val: 'paused',
				type: '=',
			}],
		});
	});
});
