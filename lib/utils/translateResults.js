const {
	translateProgress,
	translateNotStartedReason,
	translateTestLine,
	translateTestLineResult,
} = require('@suitest/translate');
const {map, compose} = require('ramda');
const text = require('@suitest/smst-to-text');

/**
 * Transforms markdown string
 * @param {string} md
 * @returns {string}
 */
const transformMarkdown = md => md
	.replace(/\*\*(.*?)\*\*/g, '$1') // bold text -> regular text
	.replace(/\(mailto:(.*?)\)/g, '($1)') // mailto links -> regular link
	.replace(/!?\[(.*?)\]\((.*?)\)({.*})?/g, (_, text, url) => {
		return text === url ? `(${url})` : `${text} (${url})`;
	}); // links, previews -> text + url

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
 * @param {{title: {type: any, value: string}, description: {type: any, value: string}}} result
 * @returns {string} - composed text
 */

const titleDescToText = (result) => {
	const titleResult = text.toText(result.title, {});

	if (result.description) {
		const descriptionResult = text.toText(result.description, {});

		return `${titleResult}\n${descriptionResult}`;
	}

	return `${titleResult}`;
};

module.exports = {
	translateNotStartedReason: compose(titleDescToText, transformAllMarkdowns, translateNotStartedReason),
	translateProgress: compose(titleDescToText, transformAllMarkdowns, translateProgress),

	// for testing
	transformMarkdown,
	transformAllMarkdowns,
	titleDescToText,
	translateTestLine,
	translateTestLineResult,
};
