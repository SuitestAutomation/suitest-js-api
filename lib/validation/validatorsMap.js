const validationKeys = require('../../lib/constants/validationKeys');
const validators = require('./validators');

const validatorsMap = {
	[validationKeys.NON_EMPTY_STRING]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.NON_EMPTY_STRING, value, text);
	},
	[validationKeys.STRING]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.STRING, value, text);
	},
	[validationKeys.POSITIVE_NUMBER]: (value, text) => {
		return validators.validatePositiveNumber(value, text);
	},
	[validationKeys.ST_VAR_OR_POSITIVE_NUMBER]: (value, text) => {
		return validators.validateStVarOrPositiveNumber(value, text);
	},
	[validationKeys.ST_VAR_OR_POSITIVE_NUMBER_NOT_ZERO]: (value, text) => {
		return validators.validateStVarOrPositiveNumberNotZero(value, text);
	},
	[validationKeys.ST_VAR_OR_NUMBER]: (value, text) => {
		return validators.validateStVarOrNumber(value, text);
	},
	[validationKeys.NON_EMPTY_STRING_OR_UNDEFINED]: (value, text) => {
		return validators.validateNonEmptyStringOrUndefined(value, text);
	},
	[validationKeys.NON_EMPTY_STRING_OR_NUll]: (value, text) => {
		return validators.validateNonEmptyStringOrNull(value, text);
	},
	[validationKeys.ARRAY_OF_BUTTONS]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.ARRAY_OF_BUTTONS, value, text);
	},
	[validationKeys.UUID]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.UUID, value, text);
	},
	[validationKeys.SET_SCREEN_ORIENTATION]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.SET_SCREEN_ORIENTATION, value, text);
	},
	[validationKeys.LAUNCH_MODE]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.LAUNCH_MODE, value, text);
	},
	[validationKeys.ELEMENT_SELECTOR]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.ELEMENT_SELECTOR, value, text);
	},
	[validationKeys.OPEN_SESSION]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.OPEN_SESSION, value, text);
	},
	[validationKeys.CONFIG_OVERRIDE]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.CONFIG_OVERRIDE, value, text);
	},
	[validationKeys.CONFIGURE]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.CONFIGURE, value, text);
	},
	[validationKeys.ELEMENT_PROPS]: ({data, props}, text) => {
		validators.validateJsonSchema(validationKeys.ELEMENT_PROPS, props, text);
		validators.validateRepoProps({
			data,
			props,
			text,
		});

		return props;
	},
	[validationKeys.ELEMENT_REPO_PROPS]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.ELEMENT_REPO_PROPS, value, text);
	},
	[validationKeys.REQUEST_MATCHES]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.REQUEST_MATCHES, value, text);
	},
	[validationKeys.RESPONSE_MATCHES]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.RESPONSE_MATCHES, value, text);
	},
	[validationKeys.TEST_LAUNCHER_TEST_COMMAND]: (value, text) => {
		return validators.validateNonEmptyArrayOfStrings(value, text);
	},
	[validationKeys.TEST_LAUNCHER_TOKEN]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.TEST_LAUNCHER_TOKEN, value, text);
	},
	[validationKeys.SESSION_BOOTSTRAP_TOKEN]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.SESSION_BOOTSTRAP_TOKEN, value, text);
	},
	[validationKeys.UNTIL_CONDITION_CHAIN]: value => {
		return validators.validateUntilConditionChain(value);
	},
	[validationKeys.HAD_NO_ERROR]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.HAD_NO_ERROR, value, text);
	},
	[validationKeys.TAKE_SCREENSHOT]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.TAKE_SCREENSHOT, value, text);
	},
	[validationKeys.TAP_TYPE_AND_DURATION]: ({tapType, tapDuration}, tapTypeErrorMsg, durationErrorMsg) => {
		return validators.validateTapTypeAndDuration({tapType, tapDuration}, tapTypeErrorMsg, durationErrorMsg);
	},
	[validationKeys.DIRECTIONS]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.DIRECTIONS, value, text);
	},
	[validationKeys.CSS_PROPS]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.CSS_PROPS, value, text);
	},
	[validationKeys.ELEMENT_HANDLE]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.ELEMENT_HANDLE, value, text);
	},
	[validationKeys.ELEMENT_ATTRIBUTES]: (value, text) => {
		return validators.validateJsonSchema(validationKeys.ELEMENT_ATTRIBUTES, value, text);
	},
};

Object.freeze(validatorsMap);

module.exports = validatorsMap;
