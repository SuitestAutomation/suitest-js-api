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

	(() => {
		const messages = getDiagnosticResultsMessages(getDiagnostics('elementChain.fail'));
		const expectedErrors = [
			'Property \'onmousedown\' does not exist on type \'ElementChain\'.',
			'Property \'matches\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'matchesJS\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'matchesRepo\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'doesNot\' does not exist on type \'ElementNegationChain\'.',
			'Property \'doesNot\' does not exist on type \'ElementWithoutEvalChain\'.',
			'Property \'not\' does not exist on type \'ElementNegationChain\'.',
			'Property \'not\' does not exist on type \'ElementWithoutEvalChain\'.',
			'Property \'not\' does not exist on type \'ElementNegationChain\'.',
		];

		return expectedErrors.map(error => {
			return it(`Expect ${error} to be thrown`, (done) => {
				return assert.ok(messages.includes(error), 'missing error ' + error), done();
			});
		});
	})();

	it('should compile suitest-tests', (done) => {
		const messages = getDiagnosticResultsMessages(getDiagnostics('suitest-tests'));

		assert.equal(messages.join('\n'), '', 'should compile suitest-tests');
		done();
	});
});
