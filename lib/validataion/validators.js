const Ajv = require('ajv');
const {path} = require('ramda');
const SuitestError = require('../utils/SuitestError');
const schemasMap = require('./jsonSchemas');
const {invalidInput} = require('../texts');
const validationKeys = require('../constants/validationKeys');
const {ELEMENT_PROP: ELEMENT_PROP_M} = require('../mappings');
const {ELEMENT_PROP_TYPES} = require('./elementPropTypes');
const {invalidUntilChain, incorrectElementIndex, invalidInheredProps, invalidVideoInheredProps} = require('../texts');
const {VALUE} = require('../constants/element');

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

function prettifyJsonSchemaErrors(validate) {
	let errors = [];
	const getDataName = path(['data', 'name']);

	if (validate.schema.schemaId === validationKeys.ELEMENT_PROPS) {
		errors = validate.errors
			.filter(getDataName)
			.map(i => {
				const dataName = getDataName(i);

				if (dataName in ELEMENT_PROP_M) {
					const elementPropTye = typeof dataName === 'string' ?
						ELEMENT_PROP_TYPES[ELEMENT_PROP_M[dataName]] :
						ELEMENT_PROP_TYPES[dataName];
					const elementProp = getElementPropName(ELEMENT_PROP_M, dataName);

					return `Element property '${elementProp}' should be of type ${elementPropTye}`;
				}

				return `Element property ${dataName.toString()} is unknown Symbol.`;
			});
	} else if (validate.schema.schemaId === validationKeys.CONFIGURE) {
		// example: Invalid input provided for configuration object. 'disallowCrashReports' should be boolean.
		errors = validate.errors.map(i => `'${i.dataPath.slice(1)}' ${i.message}.`);
	} else if (validate.schema.schemaId === validationKeys.ELEMENT_SELECTOR) {
		errors = validate.errors.map(i => {
			if (i.dataPath === '.index') {
				return incorrectElementIndex();
			}

			return i.message;
		});
	} else {
		errors = validate.errors.map(i => i.message);
	}

	return errors.filter((i, pos, arr) => i && arr.indexOf(i) === pos).join('\n');
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

const validateArrayOfSymbols = (val, text) => {
	if (!Array.isArray(val) || val.some(i => typeof i !== 'symbol')) {
		throwError(text);
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

const allowedUntilConditionChainTypes = [
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
		throwError(invalidUntilChain(allowedUntilConditionChainTypes.map(i => `.${i}()`).join(' ')));
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

	if (selector.hasOwnProperty('apiId')) {
		return props;
	}

	const repoProps = props.reduce((all, prop) => {
		if (prop.val === VALUE.REPO) {
			all.push(getElementPropName(ELEMENT_PROP_M, prop.name));
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
	validateArrayOfSymbols,
	validateNonEmptyStringOrUndefined,
	validateNonEmptyStringOrNull,
	validateUntilConditionChain,
	validateRepoProps,
};
