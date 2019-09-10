const {translateProgress, translateStartupError} = require('@suitest/translate/commonjs');
const {map} = require('ramda');
const {composeWhileNotNil} = require('./common');

/**
 * Transforms markdown string
 * @param {string} md
 * @returns {string}
 */
const transformMarkdown = md => md
	.replace(/\*\*(.*?)\*\*/g, '$1') // bold text -> regular text
	.replace(/\(mailto:(.*?)\)/g, '($1)') // mailto links -> plain email
	.replace(/!?\[.*?\]\((.*?)\)({:target="_blank"})?/g, '$1'); // links, previews -> url strings

/**
 * Applies tranformMarkdown to all strings in input
 * @param {*} input - object/array/string/any
 * @returns {*} input with transformed strings
 */
const transformAllMarkdowns = input => {
	if (typeof input === 'string') {
		return transformMarkdown(input);
	}
	if (typeof input === 'object' && input !== null) {
		return map(transformAllMarkdowns, input); // array or object
	}

	return input;
};

/**
 * Composes output text from result object with title and description.
 * @param {{title: string, description: string}} result
 * @returns {string} - composed text
 */
const titleDescToText = result => result.description
	? `${result.title}.\n${result.description}.`
	: `${result.title}.`;

module.exports = {
	translateStartupError: composeWhileNotNil([titleDescToText, transformAllMarkdowns, translateStartupError]),
	translateProgress: composeWhileNotNil([titleDescToText, transformAllMarkdowns, translateProgress]),

	// for testing
	transformMarkdown,
	transformAllMarkdowns,
	titleDescToText,
};
