const assert = require('assert');
const sinon = require('sinon');
const {requestMatchesComposer} = require('../../lib/composers');
const testInputError = require('../../lib/utils/testHelpers/testInputError');
const {NETWORK_PROP, NETWORK_METHOD} = require('../../lib/constants/networkRequest');
const {
	SUBJ_COMPARATOR,
	PROP_COMPARATOR,
} = require('../../lib/constants/comparator');

describe('Network Request Match Composer', () => {
	it('should provide .requestMatch and .requestMatches methods', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, requestMatchesComposer(data, chain, makeChain));

		assert.strictEqual(typeof chain.requestMatch, 'function');
		assert.strictEqual(typeof chain.requestMatches, 'function');

		const matchDescriptor = Object.getOwnPropertyDescriptor(chain, 'requestMatch');
		const matchesDescriptor = Object.getOwnPropertyDescriptor(chain, 'requestMatches');

		assert.strictEqual(matchDescriptor.enumerable, true);
		assert.strictEqual(matchDescriptor.writable, false);
		assert.strictEqual(matchDescriptor.configurable, false);

		assert.strictEqual(matchesDescriptor.enumerable, true);
		assert.strictEqual(matchesDescriptor.writable, false);
		assert.strictEqual(matchesDescriptor.configurable, false);
	});

	it('should accept single property spread to arguments', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, requestMatchesComposer(data, chain, makeChain));

		chain.requestMatch(NETWORK_PROP.METHOD, NETWORK_METHOD.GET);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.METHOD,
						val: NETWORK_METHOD.GET,
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
		});

		chain.requestMatch('Content-Type', 'text/html');
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: 'Content-Type',
						val: 'text/html',
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
		});

		chain.requestMatch(NETWORK_PROP.BODY, 'test', PROP_COMPARATOR.CONTAIN);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.BODY,
						val: 'test',
						compare: PROP_COMPARATOR.CONTAIN,
					},
				],
			},
		});
	});

	it('should throw error in case of invalid input', async() => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, requestMatchesComposer(data, chain, makeChain));

		await testInputError(chain.requestMatch, ['Content-Type']);
		await testInputError(chain.requestMatch, [Symbol('unknown'), 'test']);
		await testInputError(chain.requestMatch, [NETWORK_PROP.METHOD, NETWORK_METHOD.GET, '=']);
		await testInputError(chain.requestMatch, [NETWORK_PROP.METHOD, NETWORK_METHOD.GET, Symbol('=')]);
		await testInputError(chain.requestMatch, ['Content-Type', 500]);
		await testInputError(chain.requestMatch, [NETWORK_PROP.METHOD, 'GET']);
		await testInputError(chain.requestMatch, [NETWORK_PROP.METHOD, Symbol('GET')]);
		await testInputError(chain.requestMatch, [NETWORK_PROP.BODY, 123]);
	});

	it('should accept object with single property as object', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, requestMatchesComposer(data, chain, makeChain));

		chain.requestMatch({
			name: NETWORK_PROP.BODY,
			val: 'test',
			type: PROP_COMPARATOR.EQUAL,
		});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.BODY,
						val: 'test',
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
		});

		chain.requestMatch({
			name: NETWORK_PROP.METHOD,
			val: NETWORK_METHOD.GET,
		});
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.METHOD,
						val: NETWORK_METHOD.GET,
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
		});
	});

	it('should accept array of property definitions as a shortcut', () => {
		const data = {};
		const chain = {};
		const makeChain = sinon.spy();

		Object.defineProperties(chain, requestMatchesComposer(data, chain, makeChain));

		chain.requestMatch([
			{
				name: NETWORK_PROP.BODY,
				val: 'test',
				type: PROP_COMPARATOR.CONTAIN,
			},
			{
				name: NETWORK_PROP.METHOD,
				val: NETWORK_METHOD.POST,
				type: PROP_COMPARATOR.EQUAL,
			},
			{
				name: 'Content-Type',
				val: 'text/plain',
			},
		]);
		assert.deepStrictEqual(makeChain.lastCall.args[0], {
			request: {
				type: SUBJ_COMPARATOR.REQUEST_MATCHES,
				props: [
					{
						name: NETWORK_PROP.BODY,
						val: 'test',
						compare: PROP_COMPARATOR.CONTAIN,
					},
					{
						name: NETWORK_PROP.METHOD,
						val: NETWORK_METHOD.POST,
						compare: PROP_COMPARATOR.EQUAL,
					},
					{
						name: 'Content-Type',
						val: 'text/plain',
						compare: PROP_COMPARATOR.EQUAL,
					},
				],
			},
		});
	});
});
