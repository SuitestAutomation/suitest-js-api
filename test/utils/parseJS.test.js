const assert = require('assert');
const parseJS = require('../../lib/utils/parseJS');

describe('parseJS util', () => {
	it('should accept string and return it without changes', () => {
		assert.strictEqual(parseJS('test'), 'test');
	});

	it('should accept function and return it`s stringified version', () => {
		const func = function (arg) {
			return arg;
		};

		assert.strictEqual(parseJS(func), `(function (arg) {
			return arg;
		})()`);

		function namedFunc(arg) {
			return arg;
		}

		assert.strictEqual(parseJS(namedFunc), `(function namedFunc(arg) {
			return arg;
		})()`);

		const arrowFunc = arg => arg;

		assert.strictEqual(parseJS(arrowFunc), '(arg => arg)()');
	});

	it('should return null in case parameter is not valid', () => {
		[
			undefined,
			null,
			{},
			123,
		].forEach(wrongValue => assert.strictEqual(parseJS(wrongValue), null));
	});
});
