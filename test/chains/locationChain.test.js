const assert = require('assert');
const suitest = require('../../index');
const {
	location,
	locationAssert,
	toJSON,
	beforeSendMsg,
} = require('../../lib/chains/locationChain')(suitest);
const sinon = require('sinon');
const {assertBeforeSendMsg} = require('../../lib/utils/testHelpers');

describe('Location chain', () => {
	it('should have all necessary modifiers', () => {
		const chain = location();

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should have only allowed modifiers after condition started', () => {
		const chain = location().equal('http://suite.st');

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'undefined');
		assert.strictEqual(typeof chain.equals, 'undefined');
		assert.strictEqual(typeof chain.contain, 'undefined');
		assert.strictEqual(typeof chain.contains, 'undefined');
		assert.strictEqual(typeof chain.matchJS, 'undefined');
		assert.strictEqual(typeof chain.matchesJS, 'undefined');
		assert.strictEqual(typeof chain.matchBrightScript, 'undefined');
		assert.strictEqual(typeof chain.matchesBrightScript, 'undefined');
		assert.strictEqual(typeof chain.startWith, 'undefined');
		assert.strictEqual(typeof chain.startsWith, 'undefined');
		assert.strictEqual(typeof chain.endWith, 'undefined');
		assert.strictEqual(typeof chain.endsWith, 'undefined');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
	});

	it('should have only allowed modifiers after timeout is set', () => {
		const chain = location().timeout(1000);

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'undefined');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
	});

	it('should have only allowed modifiers after abandon is set', () => {
		const chain = location().abandon();

		assert.strictEqual(typeof chain.not, 'function');
		assert.strictEqual(typeof chain.doesNot, 'function');
		assert.strictEqual(typeof chain.isNot, 'function');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'undefined');
		assert.strictEqual(typeof chain.toString, 'function');
	});

	it('should have only allowed modifiers after it is nagated', () => {
		const chain = location().not();

		assert.strictEqual(typeof chain.not, 'undefined');
		assert.strictEqual(typeof chain.doesNot, 'undefined');
		assert.strictEqual(typeof chain.isNot, 'undefined');
		assert.strictEqual(typeof chain.timeout, 'function');
		assert.strictEqual(typeof chain.equal, 'function');
		assert.strictEqual(typeof chain.equals, 'function');
		assert.strictEqual(typeof chain.contain, 'function');
		assert.strictEqual(typeof chain.contains, 'function');
		assert.strictEqual(typeof chain.matchJS, 'function');
		assert.strictEqual(typeof chain.matchesJS, 'function');
		assert.strictEqual(typeof chain.startWith, 'function');
		assert.strictEqual(typeof chain.startsWith, 'function');
		assert.strictEqual(typeof chain.endWith, 'function');
		assert.strictEqual(typeof chain.endsWith, 'function');
		assert.strictEqual(typeof chain.clone, 'function');
		assert.strictEqual(typeof chain.abandon, 'function');
		assert.strictEqual(typeof chain.toString, 'function');
	});

	it('should generate correct socket message based on data', () => {
		assert.deepStrictEqual(toJSON({}), {
			type: 'query',
			subject: {type: 'location'},
		}, 'chain v');
		assert.deepStrictEqual(toJSON({
			isAssert: true,
			timeout: 0,
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {subject: {type: 'location'}},
			},
		}, 'chain assert');
		assert.deepStrictEqual(toJSON({isAssert: true}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {subject: {type: 'location'}},
				timeout: 2000,
			},
		}, 'chain wait');
		assert.deepStrictEqual(toJSON({
			comparator: {
				type: '=',
				val: 'val',
			},
			timeout: 0,
		}), {
			type: 'eval',
			request: {
				type: 'assert',
				condition: {
					subject: {type: 'location'},
					type: '=',
					val: 'val',
				},
			},
		}, 'chain eval');
	});

	it('should return text representation of location line', () => {
		assert.strictEqual(
			location().toString(),
			'|E|Retrieve value of current location',
		);
		assert.strictEqual(
			locationAssert().toString(),
			'|A|Assert: Current location timeout \x1B[4m2s\x1B[0m\n'
			+ '  current location  [EMPTY STRING]',
		);
		assert.strictEqual(
			locationAssert().equal('https://suite.st/').toString(),
			'|A|Assert: Current location timeout \x1B[4m2s\x1B[0m\n'
			+ '  current location = \x1B[4mhttps://suite.st/\x1B[0m',
		);
	});

	it('should define assert function', () => {
		const chain = locationAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('toJSON' in chain);
	});
});
