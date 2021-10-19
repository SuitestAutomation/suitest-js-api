// Import helpers and composers
const makeChain = require('../utils/makeChain');
const {
	makeToStringComposer,
	makeThenComposer,
	abandonComposer,
	gettersComposer,
	assertComposer,
	cloneComposer,
	makeToJSONComposer,
} = require('../composers');
const {getRequestType} = require('../utils/socketChainHelper');
const {validators, validate} = require('../validation');
const {invalidInputMessage} = require('../texts');

/**
 * @typedef {Object} ChangeDeviceStateData
 * @property {'changeDeviceState'} type
 * @property {'lock' | 'unlock'} changeDeviceStateAction
 * @property {string} [unlockPasscode]
 * @property {boolean} [isAssert]
 * @property {boolean} [isAbandoned]
 */

/**
 * @typedef {Object} ChangeDeviceStateJson
 * @property {'testLine' | 'eval' | 'query'} type
 * @property {Object} request
 * @property {'changeDeviceState'} request.type
 * @property {'lock' | 'unlock'} request.action
 * @property {string | number} [request.passcode]
 */

/**
 * @param {SUITEST_API} classInstance
  */
const changeDeviceStateFactory = (classInstance) => {
	/**
	 * @param {ChangeDeviceStateData} data
	 * @returns {ChangeDeviceStateJson}
	 */
	const toJSON = (data) => {
		const jsonData = {
			type: getRequestType(data, false),
			request: {
				type: 'changeDeviceState',
				action: data.changeDeviceStateAction,
			},
		};

		if (data.unlockPasscode !== undefined) {
			jsonData.request.passcode = data.unlockPasscode;
		}

		return jsonData;
	};

	// Build Composers
	const toStringComposer = makeToStringComposer(toString);
	const thenComposer = makeThenComposer(toJSON);
	const toJSONComposer = makeToJSONComposer(toJSON);

	/**
	 * Function accepts data object of future chain as input
	 * and returns a list of composers that should build the chain
	 * @param {ChangeDeviceStateData} data
	 * @returns {*[]}
	 */
	const getComposers = data => {
		const output = [
			toStringComposer,
			thenComposer,
			gettersComposer,
			cloneComposer,
			toJSONComposer,
		];

		if (!data.isAssert) {
			output.push(assertComposer);
		}

		if (!data.isAbandoned) {
			output.push(abandonComposer);
		}

		return output;
	};

	/**
	 * @param {'lock' | 'unlock'} action
	 * @param {number | string} [passcode]
	 */
	const changeDeviceStateChain = (action, passcode) => {
		return makeChain(
			classInstance,
			getComposers,
			{
				type: 'changeDeviceState',
				changeDeviceStateAction: validate(
					validators.CHANGE_DEVICE_STATE_ACTION,
					action,
					invalidInputMessage('changeDeviceState', 'action'),
				),
				unlockPasscode: passcode === undefined
					? undefined
					: validate(
						validators.ST_VAR_OR_POSITIVE_NUMBER,
						passcode,
						invalidInputMessage('changeDeviceState', 'passcode'),
					),
			},
		);
	};

	return {
		changeDeviceState: changeDeviceStateChain,
		changeDeviceStateAssert: (...args) => changeDeviceStateChain(...args).toAssert(),
		getComposers,
		toJSON,
	};
};

module.exports = changeDeviceStateFactory;
