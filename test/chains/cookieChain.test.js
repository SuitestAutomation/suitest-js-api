const assert = require('assert');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	cookie,
	cookieAssert,
	getComposers,
	toString,
	toJSON,
	methodToString,
} = require('../../lib/chains/cookieChain');
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');

const allCookieComposers = [
	composers.TO_STRING,
	composers.THEN,
	composers.ABANDON,
	composers.CLONE,
	composers.TIMEOUT,
	composers.NOT,
	composers.START_WITH,
	composers.END_WITH,
	composers.CONTAIN,
	composers.EQUAL,
	composers.MATCH_JS,
	composers.EXIST,
	composers.ASSERT,
	composers.GETTERS,
	composers.TO_JSON,
];

const comparatorComposers = [
	composers.START_WITH,
	composers.END_WITH,
	composers.CONTAIN,
	composers.EQUAL,
	composers.MATCH_JS,
	composers.EXIST,
];

describe('Cookie chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			...allCookieComposers,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			...allCookieComposers.filter(c => c !== composers.ABANDON),
		].sort(bySymbol), 'abandoned chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			comparator: {},
		})), [
			...allCookieComposers.filter(c => !comparatorComposers.includes(c)),
		].sort(bySymbol), 'comparator chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			comparator: {},
		})), [
			...allCookieComposers.filter(c => !comparatorComposers.includes(c)),
		].sort(bySymbol), 'comparator chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			timeout: 1000,
		})), [
			...allCookieComposers.filter(c => c !== composers.TIMEOUT),
		].sort(bySymbol), 'timeout chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isNegated: true,
		})), [
			...allCookieComposers.filter(c => c !== composers.NOT),
		].sort(bySymbol), 'negated (not/doesNot) chain');

		const chain = cookie('cookie');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString({cookieName: 'cookieName'}), 'Get cookieName cookie');
		assert.equal(toString({
			cookieName: 'cookieName',
			comparator: {type: SUBJ_COMPARATOR.EXIST},
		}), 'Check if cookieName cookie exists');
		assert.equal(toString({
			cookieName: 'cookieName',
			comparator: {type: SUBJ_COMPARATOR.MATCH_JS},
		}), 'Check if cookieName cookie matches JavaScript expression');
		assert.equal(toString({
			cookieName: 'cookieName',
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				value: 'test',
			},
		}), 'Check if cookieName cookie equals test');
	});

	it('should have methodToString', () => {
		assert.ok(methodToString({cookieName: 'cookieName'}), 'methodToString exists');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			subject: {
				type: 'cookie',
			},
			type: 'query',
		});

		assert.deepStrictEqual(toJSON({}), {
			type: 'query',
			subject: {type: 'cookie'},
		}, 'chain v');
		assert.deepStrictEqual(toJSON({cookieName: 'suitest'}), {
			type: 'query',
			subject: {
				type: 'cookie',
				cookieName: 'suitest',
			},
		});
		assert.deepStrictEqual(toJSON({timeout: 1000}), {
			type: 'query',
			subject: {type: 'cookie'},
		}, 'chain v');
		assert.deepStrictEqual(toJSON({isAssert: true}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {subject: {type: 'cookie'}},
				timeout: 2000,
			},
		}, 'chain assert');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			timeout: 1000,
		}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {subject: {type: 'cookie'}},
				timeout: 1000,
			},
		}, 'chain assert');
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: SUBJ_COMPARATOR.EQUAL,
				val: 'val',
			},
			timeout: 0,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {type: 'cookie'},
					type: '=',
					val: 'val',
				},
			},
		}, 'chain eval');

		assert.deepStrictEqual(toJSON({
			isNegated: true,
			comparator: {
				type: SUBJ_COMPARATOR.EXIST,
				val: 'val',
			},
			cookieName: 'suiteCookie',
			timeout: 1000,
		}), {
			type: 'eval',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'cookie',
						val: 'suiteCookie',
					},
					type: '!exists',
					val: 'val',
				},
				timeout: 1000,
			},
		}, 'chain eval');
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(cookie, []);
		testInputErrorSync(cookie, [1]);
	});

	it('should define assert function', () => {
		const chain = cookieAssert('suitestCookie');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
