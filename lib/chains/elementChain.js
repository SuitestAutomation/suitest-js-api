const {omit, compose, isNil} = require('ramda');
const SuitestError = require('../../lib/utils/SuitestError');
const util = require('util');

// Import utils
const makeChain = require('../utils/makeChain');

// Import chain composers
const {
	clickComposer,
	tapComposer,
	scrollComposer,
	swipeComposer,
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
	handleComposer,
	attributesComposer,
	cssPropsComposer,
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
	applyCountAndDelayAndActions,
	applyUntilCondition,
} = require('../utils/chainUtils');

const elementFactory = (classInstance, video) => {
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

		if (data.parentSelector && Reflect.has(data.parentSelector, 'index')) {
			data.parentSelector.ifMultipleFoundReturn = data.parentSelector.index;
			delete data.parentSelector.index;
		}

		if (apiId) {
			subject.apiId = apiId;
		} else {
			subject.val = data.parentSelector
				? [data.parentSelector, selectors]
				: selectors;
		}

		// query
		if (type === 'query') {
			socketMessage.subject = {
				selector: apiId
					? data.selector
					: (data.parentSelector ? [data.parentSelector, selectors] : selectors),
			};
			if (data.handle) {
				socketMessage.subject.type = 'elementHandle';
				socketMessage.subject.multiple = data.handle.multiple;
			} else if (data.attributes) {
				socketMessage.subject.type = 'elementAttributes';
				socketMessage.subject.attributes = data.attributes;
			} else if (data.cssProps) {
				socketMessage.subject.type = 'elementCssProps';
				socketMessage.subject.elementCssProps = data.cssProps;
			} else {
				socketMessage.subject.type = 'elementProps';
			}
		}

		// click and tap
		if (data.isClick || data.tap || data.isScroll || data.isSwipe) {
			let type;

			if (data.isClick) {
				type = 'click';
			} else if (data.tap) {
				type = 'tap';
			} else if (data.isScroll) {
				type = 'scroll';
			} else if (data.isSwipe) {
				type = 'swipe';
			}
			socketMessage.request = compose(
				msg => applyUntilCondition(msg, data),
				msg => applyCountAndDelayAndActions(msg, data),
			)({
				type,
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
			&& [data.setText, data.sendText, data.comparator, data.isClick, data.isMoveTo, data.tap, data.isScroll,
				data.isSwipe].every(isNil)) {
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

		// @TODO - make this composers conditional, as with others
		output.push(attributesComposer);

		const comparatorType = data.comparator && data.comparator.type;
		const isMatchesComparator = comparatorType === SUBJ_COMPARATOR_M.MATCH
			|| comparatorType === SUBJ_COMPARATOR_M.MATCH_JS
			|| comparatorType === SUBJ_COMPARATOR_M.MATCH_BRS;

		const isVisibleComparator = comparatorType === SUBJ_COMPARATOR_M.VISIBLE;

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isNegated
			&& !data.isAssert
			&& !data.isClick
			&& !data.tap
			&& !data.isSwipe
			&& !data.isScroll
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !data.comparator
			&& !data.timeout
			&& !data.handle
			&& !data.attributes
			&& !data.cssProps
		) {
			output.push(cssPropsComposer);
		}

		if (!data.isNegated
			&& !data.isClick
			&& !data.tap
			&& !data.isSwipe
			&& !data.isScroll
			&& !data.isMoveTo
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !isMatchesComparator
			&& !isVisibleComparator
			&& !data.handle
			&& !data.cssProps
		) {
			output.push(notComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		if (
			!data.timeout
			&& !data.isClick
			&& !data.isSwipe
			&& !data.isScroll
			&& !data.isMoveTo
			&& !data.tap
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !data.handle
			&& !data.cssProps
		) {
			output.push(
				timeoutComposer,
				handleComposer, // TODO - there might be a better condition set for handle composer
			);
		}

		if (
			!data.comparator
			&& !data.isClick
			&& !data.isMoveTo
			&& !data.tap
			&& !data.isSwipe
			&& !data.isScroll
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !data.handle
			&& !data.cssProps
		) {
			output.push(existComposer, visibleComposer);
			if (!data.isNegated) {
				output.push(
					matchComposer, matchRepoComposer, matchJSComposer,
					// matchBrightScriptComposer
				);
			}
		}

		if (
			!data.comparator
			&& !data.isClick
			&& !data.isMoveTo
			&& !data.tap
			&& !data.isSwipe
			&& !data.isScroll
			&& isNil(data.sendText)
			&& isNil(data.setText)
			&& !data.isNegated
			&& !data.handle
			&& !data.cssProps
		) {
			output.push(
				clickComposer,
				tapComposer,
				scrollComposer,
				swipeComposer,
				moveToComposer,
				sendTextComposer,
				setTextComposer,
			);
		}

		if (data.isClick || !isNil(data.sendText) || data.tap || data.isScroll || data.isSwipe) {
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

	// @TODO - instead of two arguments, allow defining a chain, e.g.:
	// await suitest.element([{css: '#grand-parent'}, {css: '#parent'}, {text: 'foo-bar'}])
	const elementChain = (elementSelector, parentSelector) => {
		const selector = typeof elementSelector === 'string' ? {apiId: elementSelector} : elementSelector;

		if (selector && selector.video && Object.keys(selector).length === 1) {
			return deprecatedVideo();
		}

		return makeChain(classInstance, getComposers, {
			type: 'element',
			selector: validate(
				validators.ELEMENT_SELECTOR,
				selector,
				invalidInputMessage('element', 'Element selector'),
			),
			parentSelector: parentSelector ? validate(
				validators.ELEMENT_SELECTOR,
				parentSelector,
				invalidInputMessage('element', 'Parent element selector'),
			) : null,
		});
	};

	return {
		element: elementChain,
		elementAssert: (elementSelector, parentSelector) =>
			elementChain(elementSelector, parentSelector).toAssert(),

		// For testing
		getComposers,
		toJSON,
	};
};

module.exports = elementFactory;
