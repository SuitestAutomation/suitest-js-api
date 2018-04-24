const suitest = require('suitest-js-api');
const {assert} = suitest;

describe('My super cool test', () => {
	before(async() => {
		try {
			// Start test
			await suitest.startTest('My super cool test');
		} catch (e) {
			console.error(e);
			// Mocha wouldn't stop if just throw an error here
			process.exit(1);
		}
	});

	it('should pass', async() => {
		// Open app
		await assert.openApp();

		// assert location
		await assert.location().doesNot().startWith('test');

		// assert cookie
		await assert.cookie('name').doesNot().exist();

		// test element
		await assert.element({
			css: 'div',
			index: 1,
		}).exist();
	});

	after(async() => {
		// End test
		await suitest.endTest();
	});
});
