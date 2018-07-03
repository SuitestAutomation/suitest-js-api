const ts = require('typescript');
const assert = require('assert');

const getDiagnostics = name => {
	const program = ts.createProgram([
		`./examplesTS/${name}.ts`,
	], {});

	return ts.getPreEmitDiagnostics(program);
};

describe('suitest typescripts declarations tests', () => {
	it('should compile example element chain', (done) => {
		assert.equal(getDiagnostics('elementChain').length, 0, 'should compile element chain example');
		done();
	});
	it('should not compile example element chain', (done) => {
		assert.equal(getDiagnostics('elementChain.fail').length, 1, 'should not compile element chain example');
		done();
	});
	it('should compile suitest-tests', (done) => {
		assert.equal(getDiagnostics('suitest-tests').length, 0, 'should compile suitest-tests');
		done();
	});
});
