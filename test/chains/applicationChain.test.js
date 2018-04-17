const assert = require('assert');
const {
	application,
	applicationAssert,
	getComposers,
	toString,
	toJSON,
} = require('../../lib/chains/applicationChain');
const composers = require('../../lib/constants/composer');
const {SUBJ_COMPARATOR} = require('../../lib/constants/comparator');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');

describe('Application chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.ASSERT,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ASSERT,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAssert: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.HAS_EXITED,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'assert chain');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			comparator: {},
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.TIMEOUT,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'chain with comparator');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			timeout: 1000,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.CLONE,
			composers.ASSERT,
			composers.HAS_EXITED,
			composers.GETTERS,
			composers.TO_JSON,
		].sort(bySymbol), 'chain with timeout');

		const chain = application();

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	it('should convert to string with meaningful message', () => {
		assert.equal(toString(), 'Application has exited');
	});

	it('should generate correct socket message based on data', () => {
		const defaultData = {comparator: {type: SUBJ_COMPARATOR.HAS_EXITED}};

		assert.deepStrictEqual(toJSON(defaultData), {
			type: 'eval',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
				timeout: 2000,
			},
		}, 'eval without timeout');

		assert.deepStrictEqual(toJSON({
			...defaultData,
			isAssert: true,
			timeout: 0,
		}), {
			type: 'testLine',
			request: {
				type: 'assert',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
			},
		}, 'testLine without timeout');

		assert.deepStrictEqual(toJSON({
			...defaultData,
			isAssert: true,
			timeout: 1000,
		}), {
			type: 'testLine',
			request: {
				type: 'wait',
				condition: {
					subject: {
						type: 'application',
					},
					type: 'exited',
				},
				timeout: 1000,
			},
		}, 'testLine without timeout');
	});

	it('should throw if awaited without .hasExited part', () => {
		assert.throws(() => toJSON({}));
	});

	it('should define assert function', () => {
		const chain = applicationAssert();

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
		assert.ok('toJSON' in chain);
	});
});
