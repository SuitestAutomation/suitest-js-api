import * as suitest from '../../index';

async function testPosition() {
	const {position} = suitest;

	const samplePos = position(100, 100);

	samplePos.abandon();
	samplePos.clone();
	samplePos.toString();
	samplePos.toAssert();
	samplePos.then();

	// click position
	const clickPos = position(1, 1,).click();

	await clickPos;
	await clickPos.repeat(1);
	await clickPos.repeat(5).interval(300);

	// move to position
	await position(10, 10).moveTo();

	// getters
	samplePos.it.should.with.times;
	samplePos.should.it.with.times;
	samplePos.with.should.it.times;
	samplePos.times.should.with.it;
}
