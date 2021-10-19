import * as suitest from '../../index';

async function changeDeviceStateChainTest() {
	const chain = suitest.changeDeviceState('lock');

	chain.abandon();
	chain.clone();
	chain.toString();
	chain.toString();
	chain.then(() => { /* pass */ });

	const assertChain = suitest.assert.changeDeviceState('lock');
	assertChain.abandon();
	assertChain.clone();
	assertChain.toString();
	assertChain.toString();
	assertChain.then(() => { /* pass */ });


	await suitest.changeDeviceState('lock');
	await suitest.changeDeviceState('unlock', 111111);
	await suitest.changeDeviceState('unlock', '<%passcode_from_config%>');
}
