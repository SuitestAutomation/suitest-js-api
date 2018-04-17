const suitest = require('../../index.js');
const {assert, PROP, COMP} = suitest;

describe('My super cool test', () => {
	before(async() => {
		try {
			// Start test
			await suitest.startTest('My super cool test');
		} catch (e) {
			console.error(e);
			console.error(`
		Failed to start automated sessione test.
		Check you credentials and network status and try again.
	`);
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
		await assert.element({css: 'div'}).matches({
			name: PROP.LEFT,
			type: COMP.LESSER,
			val: 400,
		});
	});

	after(async() => {
		// End test
		await suitest.endTest();
	});
});
