const assert = require('assert');
const suitest = require('../../index');
const {
	changeDeviceState,
	changeDeviceStateAssert,
	getComposers,
	toJSON,
} = require('../../lib/chains/changeDeviceStateChain')(suitest);
const composers = require('../../lib/constants/composer');
const {bySymbol, getComposerTypes} = require('../../lib/utils/testHelpers');
const {testInputErrorSync} = require('../../lib/utils/testHelpers/testInputError');

describe('changeDeviceState chain', () => {
	it('should have all necessary modifiers', () => {
		assert.deepStrictEqual(getComposerTypes(getComposers({})), [
			composers.TO_STRING,
			composers.THEN,
			composers.ABANDON,
			composers.GETTERS,
			composers.ASSERT,
			composers.CLONE,
			composers.TO_JSON,
		].sort(bySymbol), 'clear state');

		assert.deepStrictEqual(getComposerTypes(getComposers({
			isAbandoned: true,
		})), [
			composers.TO_STRING,
			composers.THEN,
			composers.GETTERS,
			composers.ASSERT,
			composers.CLONE,
			composers.TO_JSON,
		].sort(bySymbol), 'abandoned chain');

		const chain = changeDeviceState('lock');

		assert.strictEqual(chain.with, chain);
		assert.strictEqual(chain.it, chain);
		assert.strictEqual(chain.should, chain);
		assert.strictEqual(chain.times, chain);
	});

	describe('should generate correct socket message based on data', () => {
		it('lock device', () => {
			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					changeDeviceStateAction: 'lock',
				}),
				{
					type: 'testLine',
					request: {
						type: 'changeDeviceState',
						action: 'lock',
					},
				},
				'type testLine lock device',
			);
			assert.deepStrictEqual(
				toJSON({changeDeviceStateAction: 'lock'}),
				{
					type: 'eval',
					request: {
						type: 'changeDeviceState',
						action: 'lock',
					},
				},
				'type eval lock',
			);
		});

		it('unlock device', () => {
			assert.deepStrictEqual(
				toJSON({
					isAssert: true,
					changeDeviceStateAction: 'unlock',
					unlockPasscode: '1111',
				}),
				{
					type: 'testLine',
					request: {
						type: 'changeDeviceState',
						action: 'unlock',
						passcode: '1111',
					},
				},
				'type testLine unlock with passcode',
			);
			assert.deepStrictEqual(
				toJSON({
					changeDeviceStateAction: 'unlock',
					unlockPasscode: '1111',
				}),
				{
					type: 'eval',
					request: {
						type: 'changeDeviceState',
						action: 'unlock',
						passcode: '1111',
					},
				},
				'type eval unlock device with passcode',
			);
			assert.deepStrictEqual(
				toJSON({changeDeviceStateAction: 'unlock'}),
				{
					type: 'eval',
					request: {
						type: 'changeDeviceState',
						action: 'unlock',
					},
				},
				'type eval unlock without passcode',
			);
			assert.deepStrictEqual(
				toJSON({
					changeDeviceStateAction: 'unlock',
					unlockPasscode: '<%config_passcode%>',
				}),
				{
					type: 'eval',
					request: {
						type: 'changeDeviceState',
						action: 'unlock',
						passcode: '<%config_passcode%>',
					},
				},
				'type eval unlock with passcode as config variable',
			);
		});
	});

	it('should throw error in case of invalid input', () => {
		testInputErrorSync(changeDeviceState, []);
		testInputErrorSync(changeDeviceState, [-1]);
		testInputErrorSync(changeDeviceState, [null]);
		testInputErrorSync(changeDeviceState, [{}]);
		testInputErrorSync(changeDeviceState, [[]]);
		testInputErrorSync(changeDeviceState, [false]);
		testInputErrorSync(changeDeviceState, ['']);
		testInputErrorSync(changeDeviceState, ['unlocckk']);
		testInputErrorSync(changeDeviceState, ['lockk']);
		testInputErrorSync(changeDeviceState, ['unlocckk']);
		testInputErrorSync(changeDeviceState, ['unlock', '']);
		testInputErrorSync(changeDeviceState, ['unlock', 123456]);
		testInputErrorSync(changeDeviceState, ['unlock', null]);
		testInputErrorSync(changeDeviceState, ['unlock', []]);
		testInputErrorSync(changeDeviceState, ['unlock', {}]);
		testInputErrorSync(changeDeviceState, ['unlock', false]);
	});

	it('should define assert function', () => {
		const chain = changeDeviceStateAssert('lock');

		assert.ok('toString' in chain);
		assert.ok('then' in chain);
		assert.ok('clone' in chain);
		assert.ok('abandon' in chain);
	});
});
