const Ajv = require('ajv');
const {path, has} = require('ramda');
const SuitestError = require('../utils/SuitestError');
const schemasMap = require('./jsonSchemas');
const {invalidInput} = require('../texts');
const validationKeys = require('../constants/validationKeys');
const {ELEMENT_PROP} = require('../mappings');
const {ELEMENT_PROP_TYPES} = require('./elementPropTypes');
const {invalidUntilChain, incorrectElementIndex, invalidInheredProps, invalidVideoInheredProps} = require('../texts');
const {VALUE} = require('../constants/element');
const {arrToString} = require('../utils/stringUtils');
const ajv = new Ajv({
	verbose: true,
});

/**
 * Compile json schemas
 */
const schemaValidators = Object.getOwnPropertySymbols(schemasMap).reduce((map, key) => ({
	...map,
	[key]: ajv.compile(schemasMap[key]),
}), {});

function throwError(text) {
	throw new SuitestError(
		`${invalidInput()} ${text}`,
		SuitestError.INVALID_INPUT,
	);
}

const getElementPropName = (mapOfNames, name) => typeof mapOfNames[name] === 'string' ? mapOfNames[name] : name;

/**
 * @description returns prettified errors messages for element properties errors
 * @param {Object} validate
 * @returns {string[]}
 */
function prettifyElementPropsErrors(validate) {
	const getDataName = path(['data', 'name']);

	return validate.errors
		.filter(getDataName)
		.map(i => {
			const dataName = getDataName(i);

			if (Object.values(ELEMENT_PROP).includes(dataName)) {
				const elementPropTye = ELEMENT_PROP_TYPES[dataName];

				return `Element property '${dataName}' should be of type ${elementPropTye}`;
			}

			return `Element property ${dataName.toString()} is unknown.`;
		});
}

/**
 * @description returns prettified errors messages for element selector
 * @param {Object} validate
 * @returns {string[]}
 */
function prettifyElementSelectorsErrors(validate) {
	return validate.errors.map(error => {
		if (error.dataPath === '.index') {
			return incorrectElementIndex();
		}
		// check if element selector contains additional properties
		if (error.keyword === 'additionalProperties') {
			const properties = Object.keys(error.parentSchema.properties);
			const additionalProperties = Object.keys(error.data)
				.filter(prop => !properties.includes(prop))
				.join(', ');

			// will be something like:
			// Element selector should NOT have additional properties: otherProp, otherProp2
			return `${error.message}: ${additionalProperties || error.params.additionalProperty}`;
		}

		return error.message;
	});
}

function prettifyJsonSchemaErrors(validate) {
	let errors = [];

	if (validate.schema.schemaId === validationKeys.ELEMENT_PROPS) {
		errors = prettifyElementPropsErrors(validate);
	} else if (validate.schema.schemaId === validationKeys.CONFIGURE) {
		// example: Invalid input provided for configuration object. 'disallowCrashReports' should be boolean.
		errors = validate.errors.map(i => `'${i.dataPath.slice(1)}' ${i.message}.`);
	} else if (validate.schema.schemaId === validationKeys.ELEMENT_SELECTOR) {
		errors = prettifyElementSelectorsErrors(validate);
	} else {
		errors = validate.errors.map(err => {
			if (err.keyword === 'enum') {
				return `${err.message}: "${err.params.allowedValues.join('", "')}"`; // -> ...of the allowed values: "all", "currentUrl"
			}

			return err.message;
		});
	}

	return arrToString(errors.filter((i, pos, arr) => i && arr.indexOf(i) === pos));
}

/**
 * Perform ajv validation.
 * In case of invalid data, throw suitest error
 * @param {*|Symbol} schemaKey json schema of schemas map key
 * @param {*} data
 * @param {String} errorMessage
 * @returns {*} input data or thorws error
 * @throws SuitestError
 */
function validateJsonSchema(schemaKey, data, errorMessage) {
	errorMessage = errorMessage ? errorMessage + ' ' : '';
	const validate = schemaValidators[schemaKey];
	const valid = validate(data);

	if (!valid) {
		throwError(errorMessage + prettifyJsonSchemaErrors(validate));
	}

	return data;
}

const validatePositiveNumber = (val, name) => {
	if (!Number.isFinite(val) || val < 0) {
		throwError(name + ' should be positive number');
	}

	return val;
};

const validateStVarOrPositiveNumber = (val, name) => {
	if (!['number', 'string'].includes(typeof val)) {
		throwError(name + ' should be suitest configuration variable or number');
	} else if (typeof val === 'number') {
		validatePositiveNumber(val, name);
	} else if (typeof val === 'string' && !/(<%.+%>)/.test(val)) {
		throwError(name + ' should be suitest configuration variable');
	}

	return val;
};

const validateNonEmptyStringOrUndefined = (val, name) => {
	if (typeof val === 'string' && val.length || val === undefined) {
		return val;
	}

	throwError(name + ' should be non empty string or undefined');
};

const validateNonEmptyStringOrNull = (val, name) => {
	if (typeof val === 'string' && val.length || val === null) {
		return val;
	}

	throwError(name + ' should be non empty string or null');
};

const validateNonEmptyArrayOfStrings = (val, text) => {
	if (!Array.isArray(val) || !val.length || val.some(i => !i || typeof i !== 'string')) {
		throwError(text);
	}

	return val;
};

// TODO refactor this to check chain type by Symbol and not by JSON values
const allowedUntilConditionChainTypes = [
	'application',
	'cookie',
	'element',
	'javascript',
	'location',
	'network',
	'video',
];

const allowedUntilConditionChainNames = [
	'application',
	'cookie',
	'element',
	'jsExpression',
	'location',
	'networkRequest',
	'video',
];

const getSubjectType = path(['request', 'condition', 'subject', 'type']);

const validateUntilConditionChain = json => {
	const subjectType = getSubjectType(json);

	// should be one of allowed chain types
	if (!allowedUntilConditionChainTypes.includes(subjectType)) {
		throwError(invalidUntilChain(allowedUntilConditionChainNames.map(i => `.${i}()`).join(' ')));
	}

	return json;
};

/**
 * @description if element requested element fetched not from repo,
 * need forbid compare element properties values with VALUE.REPO
 * @param props
 * @param data
 * @param text
 * @returns {*}
 */
const validateRepoProps = ({props, data, text}) => {
	const selector = path(['selector'], data) || {};

	if (has('apiId', selector)) {
		return props;
	}

	const repoProps = props.reduce((all, prop) => {
		if (prop.val === VALUE.REPO) {
			all.push(prop.name && prop.name.toString());
		}

		return all;
	}, []);

	if (repoProps.length) {
		throwError(
			text + ' ' + (selector.video ? invalidVideoInheredProps : invalidInheredProps)(repoProps.join(', '))
		);
	}

	return props;
};

module.exports = {
	validateJsonSchema,
	validatePositiveNumber,
	validateNonEmptyStringOrUndefined,
	validateNonEmptyStringOrNull,
	validateUntilConditionChain,
	validateRepoProps,
	validateNonEmptyArrayOfStrings,
	validateStVarOrPositiveNumber,
};
