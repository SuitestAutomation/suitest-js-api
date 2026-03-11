const ts = require('typescript');
const assert = require('assert').strict;
const {prop} = require('ramda');
const path = require('path');

const typescriptCompilerOptions = {
	'module': ts.ModuleKind.System,
	'maxNodeModuleJsDepth': 1000,
	'preserveConstEnums': true,
	'diagnostics': true,
	'target': ts.ScriptTarget.ES2015,
	'noImplicitAny': true,
	'skipLibCheck': true,
	'allowSyntheticDefaultImports': false,
	'moduleResolution': ts.ModuleResolutionKind.NodeJs,
	'lib': [
		'lib.dom.d.ts',
		'lib.es2015.d.ts',
		'lib.es2016.d.ts',
		'lib.es2015.promise.d.ts',
	],
};

const getDiagnosticResultsMessages = (diagnosticResults = []) => {
	return diagnosticResults.map(prop('messageText'));
};

describe('suitest typescripts declarations tests', () => {
	const shouldCompile = [
		'elementChain', 'networkRequestChain', 'javascriptExpressionChain',
		'locationChain', 'cookieChain', 'applicationChain',
		'clearAppDataChain', 'executeCommandChain', 'openAppChain',
		'openUrlChain', 'pollUrlChain', 'positionChain',
		'pressButtonChain', 'sleepChain', 'windowChain',
		'videoChain', 'playstationVideoChain', 'indexTest',
		'runTestChain', 'takeScreenshotChain', 'saveScreenshotChain',
		'setScreenOrientation', 'closeAppChain', 'suspendAppChain',
		'relativePositionChain', 'ocrChain', 'imageChain', 'getLastVTScreenshotChain',
		'launcherConfig',
		// 'executeBrightScriptChain', 'brightScriptExpressionChain',
	];

	const shouldFail = [
		'networkRequestChain.fail', 'elementChain.fail', 'videoChain.fail', 'playstationVideoChain.fail',
		'runTestChain.fail', 'cookieChain.fail',
	];

	const examplesDir = path.join(__dirname, 'examplesTS');
	const allExamplePaths = [...new Set([...shouldCompile, ...shouldFail])]
		.map(name => path.join(examplesDir, `${name}.ts`));

	const program = ts.createProgram(allExamplePaths, typescriptCompilerOptions);
	const diagnostics = ts.getPreEmitDiagnostics(program);
	const globalDiagnostics = diagnostics.filter(diagnostic => !diagnostic.file);
	const diagnosticsByFile = diagnostics.reduce((acc, diagnostic) => {
		if (!diagnostic.file) {
			return acc;
		}
		const fileName = path.resolve(diagnostic.file.fileName);
		const existing = acc.get(fileName);

		if (existing) {
			existing.push(diagnostic);
		} else {
			acc.set(fileName, [diagnostic]);
		}

		return acc;
	}, new Map());

	const getDiagnostics = name => {
		const fileName = path.resolve(path.join(examplesDir, `${name}.ts`));
		const fileDiagnostics = diagnosticsByFile.get(fileName) || [];

		return [...globalDiagnostics, ...fileDiagnostics];
	};

	(() => {
		const messages = getDiagnosticResultsMessages(getDiagnostics('elementChain.fail'));
		const expectedErrors = [
			'Property \'onmousedown\' does not exist on type \'ElementChain\'.',
			'Property \'matches\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'matchesJS\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'matchesBrightScript\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'matchesRepo\' does not exist on type \'ElementWithoutNegation\'.',
			'Property \'doesNot\' does not exist on type \'ElementWithoutEvalChain\'.',
			'Property \'doesNot\' does not exist on type \'ElementNegationChain\'.',
			'Property \'doesNot\' does not exist on type \'ElementWithoutEvalChain\'.',
			'Property \'not\' does not exist on type \'ElementNegationChain\'.',
			'Property \'not\' does not exist on type \'ElementWithoutEvalChain\'.',
			'Property \'not\' does not exist on type \'ElementNegationChain\'.',
			'Property \'interval\' does not exist on type \'ElementEmptyChain\'.',
			'Property \'timeout\' does not exist on type \'ElementEmptyChain\'.',
			'Property \'count\' does not exist on type \'ElementEmptyChain\'.',
			'Property \'until\' does not exist on type \'ElementEmptyChain\'.',
		];

		return expectedErrors.map(error => {
			return it(`Expect ${error} to be thrown`, (done) => {
				return assert.ok(messages.includes(error), 'missing error ' + error), done();
			});
		});
	})();

	// should compile files without error
	shouldCompile.forEach(fileName => {
		it(`should compile example ${fileName}`, (done) => {
			const messages = getDiagnosticResultsMessages(getDiagnostics(fileName));

			assert.equal(messages.join('\n'), '', `should compile ${fileName} example without errors`);
			done();
		});
	});

	// should compile files with error
	shouldFail.forEach(fileName => {
		it(`should not compile example ${fileName} chain`, (done) => {
			assert.ok(
				getDiagnostics(fileName).length > 0,
				`should not compile ${fileName} chain example`,
			);
			done();
		});
	});
});
