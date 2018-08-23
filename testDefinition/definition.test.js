const ts = require('typescript');
const assert = require('assert');
const {prop} = require('ramda');

const typescriptCompilerOptions = {
	'module': ts.ModuleKind.System,
	'maxNodeModuleJsDepth': 1000,
	'preserveConstEnums': true,
	'diagnostics': true,
	'target': ts.ScriptTarget.ES2015,
	'noImplicitAny': true,
	'allowSyntheticDefaultImports': false,
	'moduleResolution': ts.ModuleResolutionKind.NodeJs,
	'lib': [
		'lib.dom.d.ts',
		'lib.es2015.d.ts',
		'lib.es2016.d.ts',
		'lib.es2015.promise.d.ts',
	],
};

const getDiagnostics = name => {
	const program = ts.createProgram(
		[`./examplesTS/${name}.ts`],
		typescriptCompilerOptions
	);

	return ts.getPreEmitDiagnostics(program);
};

const getDiagnosticResultsMessages = (diagnosticResults = []) => {
	return diagnosticResults.map(prop('messageText'));
};

describe('suitest typescripts declarations tests', () => {
	it('should compile example element chain', (done) => {
		const messages = getDiagnosticResultsMessages(getDiagnostics('elementChain'));

		assert.equal(messages.join('\n'), '', 'should compile element chain example without errors');
		done();
	});
	it('should not compile example element chain', (done) => {
		assert.equal(getDiagnostics('elementChain.fail').length, 4, 'should not compile element chain example');
		done();
	});
	it('should compile suitest-tests', (done) => {
		const messages = getDiagnosticResultsMessages(getDiagnostics('suitest-tests'));

		assert.equal(messages.join('\n'), '', 'should compile suitest-tests');
		done();
	});
});
