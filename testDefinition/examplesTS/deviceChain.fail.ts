import * as suitest from '../../index'

async function deviceTest() {
	const {device, assert} = suitest;

	await device().setOrientation();
	await device().setOrientation("blah");
	await assert.device().setOrientation("portrait-reversed");
}
