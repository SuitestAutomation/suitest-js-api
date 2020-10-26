const {omit, compose, isNil} = require('ramda');
const SuitestError = require('../../lib/utils/SuitestError');
const util = require('util');

// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	clickComposer,
	notComposer,
	existComposer,
	matchComposer,
	matchRepoComposer,
	matchJSComposer,
	// matchBrightScriptComposer,
	timeoutComposer,
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	cloneComposer,
	repeatComposer,
	intervalComposer,
	moveToComposer,
	sendTextComposer,
	setTextComposer,
	assertComposer,
	gettersComposer,
	makeToJSONComposer,
	untilComposer,
	visibleComposer,
} = require('../composers');
const {
	invalidInputMessage,
	warnVideoAsElementDeprecation,
	assertElementMalformed,
} = require('../texts');
const {validate, validators} = require('../validation');
const {
	getRequestType,
} = require('../utils/socketChainHelper');
const {
	SUBJ_COMPARATOR: SUBJ_COMPARATOR_M,
} = require('../mappings');
const {
	elementWithComparatorToJSON,
	applyCountAndDelay,
	applyCountAndDelayAndClicks,
	applyUntilCondition,
} = require('../utils/chainUtils');

const elementFactory = (classInstance, video) => {
	const {logger} = classInstance;

	const toJSON = data => {
		const type = getRequestType(data);
		const socketMessage = {type};
		const subject = {
			type: 'element',
		};
		const apiId = data.selector.apiId;
		const selectors = omit(['apiId'], data.selector);

		if (Reflect.has(selectors, 'index')) {
			selectors.ifMultipleFoundReturn = selectors.index;
			delete selectors.index;
		}

		if (apiId) {
			subject.apiId = apiId; // not yet supported by network api
		} else {
			subject.val = selectors;
		}

		// query
		if (type === 'query') {
			socketMessage.subject = {
				type: 'elementProps',
				selector: apiId ? data.selector : selectors,
			};
		}

		// click
		if (data.isClick) {
			socketMessage.request = compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelayAndClicks(msg, data),
			)({
				type: 'click',
				target: subject,
			});
		}

		// moveTo
		if (data.isMoveTo) {
			socketMessage.request = {
				type: 'moveTo',
				target: subject,
			};
		}

		// send text
		if (!isNil(data.sendText)) {
			socketMessage.request = compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelay(msg, data),
			)({
				type: 'sendText',
				target: subject,
				val: data.sendText,
			});
		}

		// set text
		if (!isNil(data.setText)) {
			socketMessage.request = {
				type: 'setText',
				target: subject,
				val: data.setText,
			};
		}

		// element subject
		if (data.comparator) {
			socketMessage.request = elementWithComparatorToJSON(data, subject, classInstance.config.defaultTimeout);
		}

		if (type === 'testLine'
			&& [data.setText, data.sendText, data.comparator, data.isClick, data.isMoveTo].every(isNil)) {
			// Assert line mast have comparator or modifier
			throw new SuitestError(assertElementMalformed(), SuitestError.INVALID_INPUT);
		}

		return socketMessage;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toJSON);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	/**
	 * Function accepts data object of future chain as input
	 * and returns a list of composers that should build the chain
	 * @param data
	 * @returns {*[]}
	 */
	const getComposers = (data) => {
		const output = [
			toStringComposer,
			thenComposer,
			cloneComposer,
			gettersComposer,
			toJSONComposer,
		];

		const comparatorType = data.comparator && data.comparator.type;
		const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.MATCH
			|| comparatorType === SUBJ_COMPARATOR_M.MATCH_JS
			|| comparatorType === SUBJ_COMPARATOR_M.MATCH_BRS;

		const isVisibleComparator = comparatorType === SUBJ_COMPARATOR_M.VISIBLE;

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isNegated
			&& !data.isClick
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !isMatchesComparator
			&& !isVisibleComparator
		) {
			output.push(notComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (
			!data.timeout
			&& !data.isClick
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
		) {
			output.push(timeoutComposer);
		}

		if (
			!data.comparator
			&& !data.isClick
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
		) {
			output.push(existComposer);
			if (!data.isNegated) {
				output.push(
					visibleComposer, matchComposer, matchRepoComposer, matchJSComposer,
					// matchBrightScriptComposer
				);
			}
		}

		if (
			!data.comparator
			&& !data.isClick
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !data.isNegated
		) {
			output.push(
				clickComposer,
				moveToComposer,
				sendTextComposer,
				setTextComposer
			);
		}

		if (data.isClick || !isNil(data.sendText)) {
			if (!data.interval) {
				output.push(intervalComposer);
			}

			if (!data.repeat) {
				output.push(repeatComposer);
			}

			if (!data.until) {
				output.push(untilComposer);
			}
		}

		return output;
	};

	const deprecatedVideo = util.deprecate(video, warnVideoAsElementDeprecation());

	const elementChain = elementSelector => {
		const selector = typeof elementSelector === 'string' ? {apiId: elementSelector} : elementSelector;

		if (selector && selector.video && Object.keys(selector).length === 1) {
			return deprecatedVideo();
		}

		return makeChain(classInstance, getComposers, {
			type: 'element',
			selector: validate(
				validators.ELEMENT_SELECTOR,
				selector,
				invalidInputMessage('element', 'Element selector')),
		});
	};

	return {
		element: elementChain,
		elementAssert: elementSelector => elementChain(elementSelector).toAssert(),

		// For testing
		getComposers,
		toJSON,
	};
};

module.exports = elementFactory;
