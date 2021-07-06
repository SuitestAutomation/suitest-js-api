import * as suitest from '../../index';

async function lockTest() {
	const sampleLock = suitest.lock();

	await sampleLock;

	sampleLock.abandon();
	sampleLock.then();
	sampleLock.clone();
	sampleLock.toString();

	sampleLock.it.should.with.times;
	sampleLock.should.it.with.times;
	sampleLock.with.should.it.times;
	sampleLock.times.should.with.it;
}
