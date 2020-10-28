const opType = require('../../lib/utils/opType');
const assert = require('assert');

describe('opType', () => {
	it('isOpType should produce correct output', () => {
		assert.strictEqual(opType.isOpType('|AL|'), true);
		assert.strictEqual(opType.isOpType('d[AE]'), false);
	});

	it('getRequestOpType should produce correct output', () => {
		assert.strictEqual(opType.getRequestOpType({type: 'eval'}), '|E|');
		assert.strictEqual(opType.getRequestOpType({type: 'takeScreenshot'}), '|E|');
		assert.strictEqual(opType.getRequestOpType({type: 'testLine'}), '|A|');
		assert.strictEqual(opType.getRequestOpType({type: 'query'}), '|E|');
		assert.strictEqual(opType.getRequestOpType({type: 'blahblahblah'}), '');
	});

	it('getOpType should produce correct output', () => {
		assert.strictEqual(opType.getOpType({isAssert: true}), '|A|');
		assert.strictEqual(opType.getOpType(), '|E|');
		assert.strictEqual(opType.getOpType({blah: 'blah'}), '|E|');
	});
});
