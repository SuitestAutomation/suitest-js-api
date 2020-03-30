const {uniq, values} = require('ramda');
const validationKeys = require('../constants/validationKeys');
const {NETWORK_PROP, NETWORK_METHOD} = require('../constants/networkRequest');
const {PROP_COMPARATOR} = require('../constants/comparator');
const {ELEMENT_PROP, VALUE} = require('../constants/element');
const {ELEMENT_PROP_BY_TYPE} = require('./elementPropTypes');
const BORDER_STYLE = require('../constants/borderStyle');
const VIDEO_STATE = require('../constants/videoState');
const VISIBILITY_STATE = require('../constants/visibilityState');
const CONTENT_MODE = require('../constants/contentMode');
const ELEMENT_STATE = require('../constants/elementState');
const TEXT_ALIGNMENT = require('../constants/textAlignment');
const IMAGE_LOAD_STATE = require('../constants/imageLoadState');
const HAD_NO_ERROR = require('../constants/hadNoError');
const VRC = require('../constants/vrc');
const schemas = {};

schemas[validationKeys.CONFIG_OVERRIDE] = {
	'type': 'object',
	'properties': {
		'url': {'type': 'string'},
		'suitestify': {'type': 'boolean'},
		'domainList': {
			'type': 'array',
			'items': {'type': 'string'},
		},
		'freezeRules': {
			'type': 'array',
			'items': {
				'type': 'object',
				'properties': {
					'methods': {
						'type': 'array',
						'items': {'type': 'string'},
					},
					'url': {'type': 'string'},
					'type': {'type': 'string'},
					'toUrl': {'type': 'string'},
				},
			},
		},
		'codeOverrides': {'type': 'object'},
		'configVariables': {
			'type': 'array',
			'items': {
				'type': 'object',
				'properties': {
					'key': {'type': 'string'},
					'value': {'type': 'string'},
				},
				'required': ['key', 'value'],
			},
		},
		'openAppOverrideTest': {
			'type': 'string',
			'format': 'uuid',
		},
	},
};

schemas[validationKeys.START_TEST_PACK] = {
	'type': 'object',
	'required': ['testPackId', 'includeChangelist'],
	'properties': {
		'testPackId': {'type': ['number', 'string']},
		'accessTokenKey': {'type': 'string'},
		'accessTokenPassword': {'type': 'string'},
		'config': schemas[validationKeys.CONFIG_OVERRIDE],
		'includeChangelist': {'type': 'boolean'},
		'metadata': {
			'type': 'object',
			'properties': {
				'version': {'type': 'string'},
				'hash': {'type': 'string'},
				'link': {'type': 'string'},
			},
		},
	},
};

schemas[validationKeys.START_TEST] = {
	'type': 'object',
	'required': ['clientTestId'],
	'properties': {
		'name': {'type': 'string'},
		'clientTestId': {'type': 'string'},
		'description': {'type': 'string'},
	},
};

schemas[validationKeys.TAKE_SCREENSHOT] = {
	'type': 'string',
	'enum': ['raw', 'base64'],
};

schemas[validationKeys.UUID] = {
	'type': 'string',
	'format': 'uuid',
};

schemas[validationKeys.OPEN_SESSION] = {
	'type': 'object',
	'oneOf': [
		{
			'required': ['username', 'password', 'orgId'],
			'properties': {
				'username': {'type': 'string'},
				'password': {'type': 'string'},
				'orgId': {'type': 'string'},
			},
		},
		{
			'required': ['sessionToken'],
			'properties': {
				'sessionToken': {'type': 'string'},
			},
		},
		{
			'required': ['accessTokenKey', 'accessTokenPassword'],
			'properties': {
				'accessTokenKey': {'type': 'string'},
				'accessTokenPassword': {'type': 'string'},
			},
		},
	],
};

schemas[validationKeys.STRING] = {
	'type': 'string',
};

schemas[validationKeys.NON_EMPTY_STRING] = {
	'type': 'string',
	'minLength': 1,
};

schemas[validationKeys.ELEMENT_SELECTOR] = {
	'schemaId': validationKeys.ELEMENT_SELECTOR,
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'apiId': schemas[validationKeys.NON_EMPTY_STRING],
		'css': {'type': 'string'},
		'xpath': {'type': 'string'},
		'attributes': {'type': 'string'},
		'text': {'type': 'string'},
		'position': {'type': 'string'},
		'size': {'type': 'string'},
		'color': {'type': 'string'},
		'index': {
			'type': 'integer',
			'exclusiveMinimum': 0,
		},
		'video': {'const': true},
		'psVideo': {'const': true},
	},
	'anyOf': [
		{'required': ['css']},
		{'required': ['xpath']},
		{'required': ['attributes']},
		{'required': ['text']},
		{'required': ['position']},
		{'required': ['size']},
		{'required': ['color']},
		{'required': ['apiId']},
		{'required': ['video']},
		{'required': ['psVideo']},
	],
};

const deviation = {
	'if': {'properties': {'type': {'const': PROP_COMPARATOR.APPROX}}},
	'then': {'type': ['number', 'string']},
	'else': {'const': 'undefined'},
};
const propComarator = {
	'type': 'string',
	'enum': Object.values(PROP_COMPARATOR),
};

schemas[validationKeys.ELEMENT_PROPS] = {
	'schemaId': validationKeys.ELEMENT_PROPS,
	'type': 'array',
	'items': {
		'type': 'object',
		'required': ['name', 'type', 'val'],
		'anyOf': [
			{'properties': {
				'name': {
					'type': 'string',
					'enum': Object.values(ELEMENT_PROP),
				},
				'type': propComarator,
				'val': {'const': VALUE.REPO},
				deviation,
			}},
			{'properties': {
				'name': {
					'type': 'string',
					'enum': ELEMENT_PROP_BY_TYPE.integer,
				},
				'type': propComarator,
				'val': {'type': ['integer', 'string']},
				deviation,
			}},
			{'properties': {
				'name': {
					'type': 'string',
					'enum': ELEMENT_PROP_BY_TYPE.string,
				},
				'type': propComarator,
				'val': {'type': 'string'},
				deviation,
			}},
			{'properties': {
				'name': {'enum': ELEMENT_PROP_BY_TYPE.number},
				'type': propComarator,
				'val': {'type': ['number', 'string']},
				deviation,
			}},
			{'properties': {
				'name': {'enum': ELEMENT_PROP_BY_TYPE.boolean},
				'type': propComarator,
				'val': {'type': 'boolean'},
				deviation,
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.BORDER_STYLE},
				'type': propComarator,
				'val': {'enum': Object.values(BORDER_STYLE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.VIDEO_STATE},
				'type': propComarator,
				'val': {'enum': Object.values(VIDEO_STATE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.VISIBILITY},
				'type': propComarator,
				'val': {'enum': [VISIBILITY_STATE.COLLAPSED, VISIBILITY_STATE.INVISIBLE, VISIBILITY_STATE.VISIBLE]},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.CONTENT_MODE},
				'type': propComarator,
				'val': {'enum': Object.values(CONTENT_MODE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.STATE},
				'type': propComarator,
				'val': {'enum': Object.values(ELEMENT_STATE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.TEXT_ALIGNMENT},
				'type': propComarator,
				'val': {'enum': Object.values(TEXT_ALIGNMENT)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.IMAGE_LOAD_STATE},
				'type': propComarator,
				'val': {'enum': Object.values(IMAGE_LOAD_STATE)},
			}},
		],
	},
};

schemas[validationKeys.ELEMENT_REPO_PROPS] = {
	'type': 'array',
	'items': {
		'type': 'object',
		'required': ['name', 'type', 'val'],
		'additionalProperties': false,
		'properties': {
			'name': {'enum': Object.values(ELEMENT_PROP)},
			'type': propComarator,
			'val': {'const': VALUE.REPO},
			deviation,
		},
	},
};

schemas[validationKeys.REQUEST_MATCHES] = {
	'type': 'array',
	'items': {
		'type': 'object',
		'required': ['name', 'compare', 'val'],
		'anyOf': [
			{'properties': {
				'name': {'type': 'string'},
				'val': {'type': 'string'},
				'compare': propComarator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.METHOD},
				'val': {'enum': Object.values(NETWORK_METHOD)},
				'compare': {'const': PROP_COMPARATOR.EQUAL},
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.BODY},
				'val': {'type': 'string'},
				'compare': propComarator,
			}},
		],
	},
};

schemas[validationKeys.RESPONSE_MATCHES] = {
	'type': 'array',
	'items': {
		'type': 'object',
		'required': ['name', 'compare', 'val'],
		'anyOf': [
			{'properties': {
				'name': {'type': 'string'},
				'val': {'type': 'string'},
				'compare': propComarator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.STATUS},
				'val': {'type': ['number', 'string']},
				'compare': propComarator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.BODY},
				'val': {'type': 'string'},
				'compare': propComarator,
			}},
		],
	},
};

schemas[validationKeys.TEST_LAUNCHER_AUTOMATED] = {
	'type': 'object',
	'required': ['tokenKey', 'tokenPassword', 'testPackId'],
	'properties': {
		'tokenKey': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
		'testPackId': {'type': ['number', 'string']},
	},
};

schemas[validationKeys.TEST_LAUNCHER_INTERACTIVE] = {
	'type': 'object',
	'required': ['username', 'password', 'orgId', 'deviceId', 'appConfigId'],
	'properties': {
		'username': {'type': 'string'},
		'password': {'type': 'string'},
		'orgId': {'type': 'string'},
		'appConfigId': {'type': 'string'},
		'deviceId': {'type': 'string'},
	},
};

schemas[validationKeys.SESSION_BOOTSTRAP_AUTOMATED] = {
	'type': 'object',
	'required': ['sessionToken'],
	'properties': {
		'sessionToken': {
			'type': 'string',
			'minLength': 1,
		},
	},
};

schemas[validationKeys.SESSION_BOOTSTRAP_INTERACTIVE] = {
	'type': 'object',
	'required': ['sessionToken', 'appConfigId'],
	'properties': {
		'sessionToken': {
			'type': 'string',
			'minLength': 1,
		},
		'appConfigId': {
			'type': 'string',
			'minLength': 1,
		},
	},
};

schemas[validationKeys.CONFIGURE] = {
	'schemaId': validationKeys.CONFIGURE,
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'appConfigId': {'type': 'string'},
		'concurrency': {'type': 'number'},
		'configFile': {'type': 'string'},
		'continueOnFatalError': {'type': 'boolean'},
		'deviceId': {'type': 'string'},
		'disallowCrashReports': {'type': 'boolean'},
		'inspect': {'type': ['number', 'boolean', 'string']}, // --inspect=true evaluates to {inspect: 'true'}
		'inspectBrk': {'type': ['number', 'boolean', 'string']}, // same as above
		'logDir': {'type': 'string'},
		'defaultTimeout': {'type': 'number'},
		'logLevel': {'enum': ['silent', 'normal', 'verbose', 'debug', 'silly']},
		'orgId': {'type': 'string'},
		'password': {'type': 'string'},
		'repl': {'type': 'boolean'},
		'timestamp': {'type': 'string'},
		'testPackId': {'type': ['number', 'string']},
		'tokenKey': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
		'username': {'type': 'string'},
	},
};

schemas[validationKeys.ARRAY_OF_BUTTONS] = {
	'type': 'array',
	'minItems': 1,
	'items': {
		'type': 'string',
		'minLength': 1,
		'enum': uniq(values(VRC)),
	},
};

schemas[validationKeys.HAD_NO_ERROR] = {
	'schemaId': validationKeys.HAD_NO_ERROR,
	'enum': [HAD_NO_ERROR.ALL, HAD_NO_ERROR.CURRENT_URL],
};

Object.freeze(schemas);

module.exports = schemas;
