const path = require('path');
const moment = require('moment');
const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	makeToJSONComposer,
	abandonComposer,
} = require('../composers');
const t = require('../texts');
const {validate, validators} = require('../validation');
const {getFirstNotSuitestStackItem} = require('../utils/stackTraceParser');
const {DEFAULT_SCREENSHOT_DIR} = require('../constants');

const PATH_PLACEHOLDERS = ['screenshotDir', 'dateTime', 'currentFile', 'currentLine'];
// /{(screenshotDir|dateTime|currentFile|currentLine)}/
const CONTAINS_PLACEHOLDER_REGEX = new RegExp(
	'{(' + PATH_PLACEHOLDERS.join('|') + ')}', 'g',
);
// '{screenshotDir}/{dateTime}-{currentFile}-l{currentLine}.png'
const DEFAULT_PATH = path.join('{screenshotDir}', '{dateTime}-{currentFile}-l{currentLine}.png');

/**
 * @description checks that path contains any of placeholders
 * @param {string} path
 * @returns {boolean}
 */
function pathContainsPlaceholders(path) {
	return !!path.match(CONTAINS_PLACEHOLDER_REGEX);
}

const saveScreenshotFactory = (classInstance) => {
	function getPlaceholdersValues(date = new Date()) {
		const userStackItem = getFirstNotSuitestStackItem();

		return {
			screenshotDir: path.resolve(
				process.cwd(),
				classInstance.config.screenshotDir || DEFAULT_SCREENSHOT_DIR,
			),
			// example: 2021-09-06-13-40-29-954
			dateTime: moment(date).format('YYYY-MM-DD-HH-mm-ss-SSS'),
			currentFile: path.basename(userStackItem.file),
			currentLine: userStackItem.line,
		};
	}

	function processFilePath(filePath) {
		if (pathContainsPlaceholders(filePath)) {
			const placeholdersValues = getPlaceholdersValues();

			return filePath.replace(
				CONTAINS_PLACEHOLDER_REGEX,
				(_matching, value) => placeholdersValues[value],
			);
		}

		return filePath;
	}

	const toJSON = () => ({type: 'takeScreenshot'});

	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			toJSONComposer,
		];

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	/**
	 * @param {string} fileName
	 */
	const saveScreenshotChain = (fileName = DEFAULT_PATH) => {
		validate(
			validators.NON_EMPTY_STRING,
			fileName,
			t.invalidInputMessage('saveScreenshot', 'File name'),
		);

		return makeChain(classInstance, getComposers, {
			type: 'takeScreenshot',
			fileName: processFilePath(fileName),
		});
	};

	return {
		saveScreenshot: saveScreenshotChain,
		// For Unit Testing
		getComposers,
		toJSON,
		getPlaceholdersValues,
		processFilePath,
	};
};

module.exports = saveScreenshotFactory;
