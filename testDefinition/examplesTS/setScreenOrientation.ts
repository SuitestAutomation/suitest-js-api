import * as suitest from '../../index';

async function setScreenOrientationTest() {
	const chain = suitest.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);

	chain.abandon();
	chain.clone();
	chain.toString();
	chain.toString();
	chain.then(() => { /* pass */ });
	await suitest.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);

	const assertChain = suitest.assert.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);
	assertChain.abandon();
	assertChain.clone();
	assertChain.toString();
	assertChain.toString();
	assertChain.then(() => { /* pass */ });
	await suitest.setScreenOrientation(suitest.SCREEN_ORIENTATION.LANDSCAPE);
}
