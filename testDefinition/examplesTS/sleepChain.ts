import * as suitest from '../../index';

async function sleepTest() {
	const sampleSleep = suitest.sleep(null);

	await sampleSleep;

	sampleSleep.abandon();
	sampleSleep.then();
	sampleSleep.clone();
	sampleSleep.toString();

	sampleSleep.it.should.with.times;
	sampleSleep.should.it.with.times;
	sampleSleep.with.should.it.times;
	sampleSleep.times.should.with.it;
}
