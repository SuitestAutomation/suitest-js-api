const assert = require('assert');
const makeUrlFromArray = require('../../lib/utils/makeUrlFromArray');

describe('makeChainWithComposers util', () => {
	it('should return unmodified string', () => {
		const normalizedUrl = makeUrlFromArray('some string');

		assert.ok(typeof normalizedUrl, 'string', 'string');
		assert.equal(normalizedUrl, 'some string', 'url');
	});

	it('should componse url string with provided url params', () => {
		const normalizedUrl = makeUrlFromArray(['url/:id', {id: 'testId'}]);

		assert.ok(typeof normalizedUrl, 'string', 'string');
		assert.equal(normalizedUrl, 'url/testId', 'url');
	});

	it('should componse url string with multiple url params', () => {
		assert.equal(makeUrlFromArray(['url/:appId/:testId', {
			appId: 'someAppId',
			testId: 'someTestId',
		}]), 'url/someAppId/someTestId', 'url');
	});

	it('should componse url string with provided query params', () => {
		const normalizedUrl = makeUrlFromArray(['url/', {}, {id: 'testId'}]);

		assert.ok(typeof normalizedUrl, 'string', 'string');
		assert.equal(normalizedUrl, 'url/?id=testId', 'url');
	});

	it('should componse url string with multiple query params', () => {
		assert.equal(makeUrlFromArray(['url/', null, {
			appId: 'someAppId',
			testId: 'someTestId',
		}]), 'url/?appId=someAppId&testId=someTestId', 'url');
	});

	it('should componse url string with url and query params', () => {
		assert.equal(makeUrlFromArray(['url/:appId/:testId', {
			appId: 'someAppId',
			testId: 'someTestId',
		}, {
			appId: 'someAppId',
			testId: 'someTestId',
		}]), 'url/someAppId/someTestId?appId=someAppId&testId=someTestId', 'url');
	});
});
