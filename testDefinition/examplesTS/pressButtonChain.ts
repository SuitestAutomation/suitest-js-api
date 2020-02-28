import * as suitest from '../../index';

async function testPressButton() {
	await suitest.press(suitest.VRC.OK);

	// Press OK, UP once
	await suitest.press([suitest.VRC.OK, suitest.VRC.UP]);

	// Press OK exactly 10x every 10s
	await suitest.press(suitest.VRC.OK)
		.repeat(10)
		.interval(10000);

	await suitest.press(suitest.VRC.BUTTON_10);
	await suitest.press(suitest.VRC.D_PAD_CENTER);
	// getters
	const pressOk = suitest.press(suitest.VRC.OK);

	pressOk.it.should.with.times;
	pressOk.should.it.with.times;
	pressOk.with.should.it.times;
	pressOk.times.should.with.it;

	await suitest.press('ENTER').until(
		suitest.video().exist()
	)
}
