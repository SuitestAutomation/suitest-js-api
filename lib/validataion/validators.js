const Ajv = require('ajv');
const {path} = require('ramda');
const SuitestError = require('../utils/SuitestError');
const schemasMap = require('./jsonSchemas');
const {invalidInput} = require('../texts');
const validationKeys = require('../constants/validationKeys');
const {ELEMENT_PROP: ELEMENT_PROP_M} = require('../mappings');
const {ELEMENT_PROP_TYPES} = require('./elementPropTypes');
const {invalidUntilChain} = require('../texts');

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
					const elementProp = typeof ELEMENT_PROP_M[dataName] === 'string' ?
						ELEMENT_PROP_M[dataName] :
						dataName;

					return `Element property '${elementProp}' should be of type ${elementPropTye}`;
				}

				return `Element property ${dataName.toString()} is unknown Symbol.`;
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

const validateArrayOfSymbols = (val, name) => {
	if (!Array.isArray(val) || val.some(i => typeof i !== 'symbol')) {
		throwError(name + ' should be array of symbols');
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

module.exports = {
	validateJsonSchema,
	validatePositiveNumber,
	validateArrayOfSymbols,
	validateNonEmptyStringOrUndefined,
	validateNonEmptyStringOrNull,
	validateUntilConditionChain,
};
