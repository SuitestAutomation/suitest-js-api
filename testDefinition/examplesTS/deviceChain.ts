import * as suitest from '../../index'

async function deviceTest() {
	const {device} = suitest;

	device().abandon();
	device().clone();
	device().then();
	device().toString();
	await device().setOrientation("portrait");
	await device().setOrientation("landscape-reversed");
	await device().setOrientation("portrait-reversed");
	await device().setOrientation("landscape");
}
