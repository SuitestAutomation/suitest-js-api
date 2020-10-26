/* eslint-disable max-len */

const assert = require('assert');
const {EOL} = require('os');
const {
	getErrorMessage,
	getInfoErrorMessage,
	responseMessageCode,
	responseMessageInfo,
} = require('../../lib/utils/socketErrorMessages');

describe('Socket error messages', () => {
	it('test response message getters', () => {
		assert.equal(responseMessageInfo({message: {info: 'test'}}), 'test');
		assert.equal(responseMessageCode({message: {code: 'test'}}), 'test');
	});

	it('Error message getter should fails', () => {
		assert.throws(getErrorMessage);
		assert.throws(() => getErrorMessage({}));
	});

	it('should test getInfoErrorMessage', () => {
		const msg1 = getInfoErrorMessage(
			'message',
			'prefix ',
			{errorType: 'testIsNotStarted'},
			'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg1,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1',
		);

		const msg2 = getInfoErrorMessage('message', 'prefix ', {
			result: 'fatal',
		}, 'stack\n\tat line1\n\tat line2').replace(/\r/gm, '');

		assert.strictEqual(
			msg2,
			'prefix message Test session will now close and all remaining Suitest commands will fail. To allow execution of remaining Suitest commands call suitest.startTest() or fix this error.\n\tat line1'
		);

		const msg3 = getInfoErrorMessage(
			'message',
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2'
		).replace(/\r/gm, '');

		assert.strictEqual(msg3, 'prefix message\n\tat line1');

		const msg4 = getInfoErrorMessage(
			'message' + EOL,
			'prefix ',
			{},
			'stack\n\tat line1\n\tat line2'
		);

		assert.strictEqual(msg4, 'prefix message' + EOL + '\tat line1');
	});
});
