module.exports = {
	'env': {
		'node': true,
		'es6': true,
		'mocha': true,
		'commonjs': true,
	},
	'extends': 'eslint:recommended',
	'parserOptions': {
		'ecmaVersion': 2018,
		'ecmaFeatures': {
			'experimentalObjectRestSpread': true,
		},
	},
	'rules': {
		'no-console': 'off',
		'no-constant-condition': ['error', {'checkLoops': false}],
		'no-unsafe-negation': 'warn',
		'default-case': 'warn',
		'no-else-return': 'warn',
		'no-empty-function': 'error',
		'no-eval': 'error',
		'no-fallthrough': 'warn',
		'no-implied-eval': 'error',
		'no-labels': 'error',
		'no-lone-blocks': 'warn',
		'no-multi-spaces': 'warn',
		'no-throw-literal': 'warn',
		'no-useless-return': 'error',
		'no-unreachable': 'warn',
		'no-unused-vars': 'warn',
		'no-with': 'error',
		'radix': 'warn',
		'vars-on-top': 'warn',
		'no-duplicate-imports': 'warn',
		'no-useless-computed-key': 'warn',
		'no-useless-constructor': 'warn',
		'no-useless-rename': 'warn',
		'no-var': 'warn',
		'prefer-const': 'warn',
		'symbol-description': 'warn',

		// Styles
		'indent': ['warn', 'tab', {'SwitchCase': 1}],
		'array-bracket-spacing': ['warn', 'never'],
		'block-spacing': 'warn',
		'brace-style': 'warn',
		'camelcase': 'warn',
		'comma-dangle': ['warn', 'always-multiline'],
		'comma-spacing': 'warn',
		'comma-style': 'warn',
		'computed-property-spacing': 'warn',
		'eol-last': 'warn',
		'func-call-spacing': 'warn',
		'key-spacing': 'warn',
		'keyword-spacing': 'warn',
		'linebreak-style': 'warn',
		'max-len': [
			'warn',
			{
				'code': 120,
				'ignoreComments': true,
				'ignoreTemplateLiterals': true,
				'ignoreStrings': true,
			},
		],
		'new-cap': 'warn',
		'newline-after-var': 'warn',
		'newline-before-return': 'warn',
		'no-lonely-if': 'warn',
		'no-multiple-empty-lines': ['warn', {'max': 1, 'maxBOF': 0, 'maxEOF': 1}],
		'no-trailing-spaces': 'warn',
		'no-whitespace-before-property': 'warn',
		'object-curly-newline': ['warn', {'consistent': true}],
		'object-curly-spacing': ['warn', 'never'],
		'object-property-newline': ['warn', {'allowAllPropertiesOnSameLine': true}],
		'one-var-declaration-per-line': 'warn',
		'padded-blocks': ['warn', 'never'],
		'quotes': ['warn', 'single', {'avoidEscape': true}],
		'semi-spacing': 'warn',
		'semi': 'warn',
		'space-before-blocks': 'warn',
		'space-before-function-paren': ['warn', 'never'],
		'space-in-parens': 'warn',
		'spaced-comment': ['warn', 'always'],
		'unicode-bom': 'warn',
		'arrow-spacing': 'warn',
		'template-curly-spacing': 'warn',
		'yield-star-spacing': 'warn',
	},
};
