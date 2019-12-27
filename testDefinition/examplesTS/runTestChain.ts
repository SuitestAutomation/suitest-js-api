import * as suitest from '../../index';

async function runTest() {
	await suitest.assert.runTest('testId');
	await suitest.assert.runTest('testId').repeat(10);
	await suitest.assert.runTest('testId').until(suitest.element({xpath: 'SomeElement'})).repeat(10);

	// getters
	const runTest1 = suitest.assert.runTest('suitest.VRC.OK');

	runTest1.it.should.with.times;
	runTest1.should.it.with.times;
	runTest1.with.should.it.times;
	runTest1.times.should.with.it;
}
