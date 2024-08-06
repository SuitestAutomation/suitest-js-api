const assert = require('assert');
const {EOL} = require('os');
const suitest = require('../../index');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');
const {
	cookie,
	cookieAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/cookieChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {SUBJ_COMPARATOR, PROP_COMPARATOR} = require('../../lib/constants/comparator');
const COOKIE_PROP = require('../../lib/constants/cookieProp');
const SuitestError = require('../../lib/utils/SuitestError');

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
	composers.WITH_PROPERTIES,
];

const checkingDataComposers = [
	composers.START_WITH,
	composers.END_WITH,
	composers.CONTAIN,
	composers.EQUAL,
	composers.MATCH_JS,
	composers.EXIST,
	composers.WITH_PROPERTIES,
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
			...allCookieComposers.filter(c => !checkingDataComposers.includes(c)),
		].sort(bySymbol), 'chain should not contain any checking data composers');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			properties: {},
		})), [
			...allCookieComposers.filter(c => !checkingDataComposers.includes(c)),
		].sort(bySymbol), 'chain should not contain any checking data composers');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			timeout: 1000,
		})), [
			...allCookieComposers.filter(c => c !== composers.TIMEOUT),
		].sort(bySymbol), 'timeout chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isNegated: true,
		})), [
			...allCookieComposers.filter(c => c !== composers.NOT),
		].sort(bySymbol), 'negated (not/doesNot/isNot) chain');

		const chain = cookie('cookie');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
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
				type: 'assert',
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
				type: 'assert',
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
				type: 'assert',
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

	describe('should generate correct json message when withProperties', () => {
		const cookieChain = cookie('cookie-name');
		const cookieWithPropsJSONBase = (properties) => ({
			request: {
				condition: {
					subject: {
						type: 'cookie',
						val: 'cookie-name',
					},
					type: 'withProperties',
					properties,
				},
				timeout: 2000,
				type: 'assert',
			},
			type: 'eval',
		});

		it('with not specified "type" field', () => {
			const properties = [
				{
					property: 'value',
					val: 'some property value',
				},
				{
					property: 'httpOnly',
					val: false,
				},
			];
			const json = cookieWithPropsJSONBase([
				{
					property: 'value',
					type: PROP_COMPARATOR.EQUAL,
					val: 'some property value',
				},
				{
					property: 'httpOnly',
					type: PROP_COMPARATOR.EQUAL,
					val: false,
				},
			]);

			assert.deepStrictEqual(
				cookieChain.withProperties(properties).toJSON(),
				json,
			);
			assert.deepStrictEqual(
				cookieChain.withProperties(properties).toAssert().toJSON(),
				{
					...json,
					type: 'testLine',
				},
			);
		});

		it('with specified "type" field', () => {
			const properties = [
				{
					property: 'value',
					val: 'some property value',
					type: PROP_COMPARATOR.CONTAIN,
				},
				{
					property: 'httpOnly',
					type: PROP_COMPARATOR.NOT_EQUAL,
					val: false,
				},
			];
			const json = cookieWithPropsJSONBase([
				{
					property: 'value',
					type: PROP_COMPARATOR.CONTAIN,
					val: 'some property value',
				},
				{
					property: 'httpOnly',
					type: PROP_COMPARATOR.NOT_EQUAL,
					val: false,
				},
			]);

			assert.deepStrictEqual(
				cookieChain.withProperties(properties).toJSON(),
				json,
			);
			assert.deepStrictEqual(
				cookieChain.withProperties(properties).toAssert().toJSON(),
				{...json, type: 'testLine'},
			);
		});
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(cookie, []);
		testInputErrorSync(cookie, [1]);
	});

	describe('.withProperties should', () => {
		const stringCookieProperties = [COOKIE_PROP.VALUE, COOKIE_PROP.DOMAIN, COOKIE_PROP.PATH];
		const booleanCookeProperties = [COOKIE_PROP.HTTP_ONLY, COOKIE_PROP.SECURE];
		const stringComparators = [
			PROP_COMPARATOR.EQUAL,
			PROP_COMPARATOR.NOT_EQUAL,
			PROP_COMPARATOR.CONTAIN,
			PROP_COMPARATOR.NOT_CONTAIN,
			PROP_COMPARATOR.START,
			PROP_COMPARATOR.NOT_START,
			PROP_COMPARATOR.END,
			PROP_COMPARATOR.NOT_END,
		];
		const booleanComparators = [
			PROP_COMPARATOR.EQUAL,
			PROP_COMPARATOR.NOT_EQUAL,
		];
		const cookieChain = cookie('cookieName');

		it('throw error in case of invalid input', () => {
			const suitestInvalidInputError = (message) => new SuitestError(message, SuitestError.INVALID_INPUT);

			const shouldBeArrayError = suitestInvalidInputError(
				'Invalid input provided for .withProperties function. should be array',
			);

			assert.throws(() => cookieChain.withProperties(''), shouldBeArrayError);
			assert.throws(() => cookieChain.withProperties(1), shouldBeArrayError);
			assert.throws(() => cookieChain.withProperties(true), shouldBeArrayError);
			assert.throws(() => cookieChain.withProperties({}), shouldBeArrayError);

			const itemShouldBeObjectErr = suitestInvalidInputError(
				'Invalid input provided for .withProperties function. item at [0] index should be object',
			);

			assert.throws(() => cookieChain.withProperties([[]]), itemShouldBeObjectErr);
			assert.throws(() => cookieChain.withProperties([1]), itemShouldBeObjectErr);
			assert.throws(() => cookieChain.withProperties([true]), itemShouldBeObjectErr);

			const itemShouldHavRequiredProp = (propName) => suitestInvalidInputError(
				`Invalid input provided for .withProperties function. item at [0] index should have required property '.${propName}'`,
			);

			assert.throws(() => cookieChain.withProperties([{}]), itemShouldHavRequiredProp('property'));
			assert.throws(() => cookieChain.withProperties([{property: ''}]), itemShouldHavRequiredProp('val'));

			const itemShouldHaveValidProperty = suitestInvalidInputError(
				`Invalid input provided for .withProperties function. ${EOL}` +
				`\titem at [0].property index should be equal to one of the allowed values: "value", "path", "domain"${EOL}` +
				`\titem at [0].property index should be equal to one of the allowed values: "httpOnly", "secure"${EOL}` +
				'\titem at [0] index should match some schema in anyOf',
			);

			assert.throws(
				() => cookieChain.withProperties([{
					property: 'unknown property',
					val: 'some val',
					type: PROP_COMPARATOR.EQUAL,
				}]),
				itemShouldHaveValidProperty,
			);

			const itemShouldHaveValidType = suitestInvalidInputError(
				`Invalid input provided for .withProperties function. ${EOL}` +
				`\titem at [0].type index should be equal to one of the allowed values: "=", "!=", "~", "!~", "^", "!^", "$", "!$"${EOL}` +
				`\titem at [0].property index should be equal to one of the allowed values: "httpOnly", "secure"${EOL}` +
				'\titem at [0] index should match some schema in anyOf',
			);

			assert.throws(
				() => cookieChain.withProperties([{
					property: COOKIE_PROP.VALUE,
					val: 'some val',
					type: 'unknown type',
				}]),
				itemShouldHaveValidType,
			);

			// check that string cookie properties do not accept not string
			stringCookieProperties.forEach((propName) => {
				const stringPropShouldBeString = suitestInvalidInputError(
					`Invalid input provided for .withProperties function. ${EOL}` +
					`\titem at [0].val index should be string${EOL}` +
					`\titem at [0].property index should be equal to one of the allowed values: "httpOnly", "secure"${EOL}` +
					'\titem at [0] index should match some schema in anyOf',
				);

				assert.throws(
					() => cookieChain.withProperties([{
						property: propName,
						val: 1,
						type: PROP_COMPARATOR.EQUAL,
					}]),
					stringPropShouldBeString,
				);
			});

			// check that boolean cookie property do no accept not boolean
			booleanCookeProperties.forEach((propName) => {
				const booleanPropShouldBeBoolean = suitestInvalidInputError(
					`Invalid input provided for .withProperties function. ${EOL}` +
					`\titem at [0].property index should be equal to one of the allowed values: "value", "path", "domain"${EOL}` +
					`\titem at [0].val index should be boolean${EOL}` +
					'\titem at [0] index should match some schema in anyOf',
				);

				assert.throws(
					() => cookieChain.withProperties([{
						property: propName,
						val: 1,
						type: PROP_COMPARATOR.EQUAL,
					}]),
					booleanPropShouldBeBoolean,
				);
			});
		});

		it('not throw error when string comparators applied for string cookie properties', () => {
			stringCookieProperties.forEach((propName) => {
				stringComparators.forEach((propType) => {
					cookieChain.withProperties([{
						property: propName,
						val: 'some val',
						type: propType,
					}]);
				});
			});
		});

		it('not throw error when boolean comparators applied for boolean cookie properties', () => {
			booleanCookeProperties.forEach((propName) => {
				booleanComparators.forEach((propType) => {
					cookieChain.withProperties([{
						property: propName,
						val: true,
						type: propType,
					}]);
				});
			});
		});
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
