import * as suitest from '../../index';

async function unlockTest() {
	const sampleUnlock = suitest.unlock();

	await sampleUnlock;

	sampleUnlock.abandon();
	sampleUnlock.then();
	sampleUnlock.clone();
	sampleUnlock.toString();

	sampleUnlock.it.should.with.times;
	sampleUnlock.should.it.with.times;
	sampleUnlock.with.should.it.times;
	sampleUnlock.times.should.with.it;
}
