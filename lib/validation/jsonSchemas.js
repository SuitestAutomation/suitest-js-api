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
const TAP_TYPES = require('../constants/tapTypes');
const DIRECTIONS = require('../constants/directions');
const VRC = require('../constants/vrc');
const SCREEN_ORIENTATION = require('../constants/screenOrientation');
const LAUNCH_MODE = require('../constants/launchMode');
const COOKIE_PROP = require('../constants/cookieProp');
const schemas = {};

const CONFIG_OVERRIDE_PROPERTIES = {
	'url': {'type': 'string'},
	'suitestify': {'type': 'boolean'},
	'domainList': {
		'type': 'array',
		'items': {'type': 'string'},
	},
	'mapRules': {
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
};

schemas[validationKeys.CONFIG_OVERRIDE] = {
	'type': 'object',
	'properties': {
		...CONFIG_OVERRIDE_PROPERTIES,
	},
};

schemas[validationKeys.LAUNCH_MODE] = {
	'type': 'string',
	'enum': Object.values(LAUNCH_MODE),
};

schemas[validationKeys.SET_SCREEN_ORIENTATION] = {
	'type': 'string',
	'enum': Object.values(SCREEN_ORIENTATION),
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
	'required': ['tokenId', 'tokenPassword'],
	'properties': {
		'tokenId': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
	},
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
		'linkText': {'type': 'string'},
		'partialLinkText': {'type': 'string'},
		'position': {'type': 'string'},
		'size': {'type': 'string'},
		'color': {'type': 'string'},
		'index': {
			'type': 'integer',
			'exclusiveMinimum': 0,
		},
		'handle': schemas[validationKeys.NON_EMPTY_STRING],
		'active': {'type': 'boolean'},
	},
	'anyOf': [
		{'required': ['css']},
		{'required': ['xpath']},
		{'required': ['attributes']},
		{'required': ['text']},
		{'required': ['linkText']},
		{'required': ['partialLinkText']},
		{'required': ['position']},
		{'required': ['size']},
		{'required': ['color']},
		{'required': ['apiId']},
		{'required': ['handle']},
		{'required': ['active']},
	],
};

const deviation = {
	'if': {'properties': {'type': {'const': PROP_COMPARATOR.APPROX}}},
	'then': {'type': ['number', 'string']},
	'else': {'const': 'undefined'},
};
const propComparator = {
	'type': 'string',
	'enum': Object.values(PROP_COMPARATOR),
};

const stringComparators = () => ({
	'type': 'string',
	'enum': [
		PROP_COMPARATOR.EQUAL,
		PROP_COMPARATOR.NOT_EQUAL,
		PROP_COMPARATOR.CONTAIN,
		PROP_COMPARATOR.NOT_CONTAIN,
		PROP_COMPARATOR.START,
		PROP_COMPARATOR.NOT_START,
		PROP_COMPARATOR.END,
		PROP_COMPARATOR.NOT_END,
	],
});

const booleanComparators = () => ({
	'type': 'string',
	'enum': [PROP_COMPARATOR.EQUAL, PROP_COMPARATOR.NOT_EQUAL],
});

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
				'type': propComparator,
				'val': {'const': VALUE.REPO},
				deviation,
			}},
			{'properties': {
				'name': {
					'type': 'string',
					'enum': ELEMENT_PROP_BY_TYPE.integer,
				},
				'type': propComparator,
				'val': {'type': ['integer', 'string']},
				deviation,
			}},
			{'properties': {
				'name': {
					'type': 'string',
					'enum': ELEMENT_PROP_BY_TYPE.string,
				},
				'type': propComparator,
				'val': {'type': 'string'},
				deviation,
			}},
			{'properties': {
				'name': {'enum': ELEMENT_PROP_BY_TYPE.number},
				'type': propComparator,
				'val': {'type': ['number', 'string']},
				deviation,
			}},
			{'properties': {
				'name': {'enum': ELEMENT_PROP_BY_TYPE.boolean},
				'type': propComparator,
				'val': {'type': 'boolean'},
				deviation,
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.BORDER_STYLE},
				'type': propComparator,
				'val': {'enum': Object.values(BORDER_STYLE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.VIDEO_STATE},
				'type': propComparator,
				'val': {'enum': Object.values(VIDEO_STATE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.VISIBILITY},
				'type': propComparator,
				'val': {'enum': [VISIBILITY_STATE.COLLAPSED, VISIBILITY_STATE.INVISIBLE, VISIBILITY_STATE.VISIBLE]},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.CONTENT_MODE},
				'type': propComparator,
				'val': {'enum': Object.values(CONTENT_MODE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.STATE},
				'type': propComparator,
				'val': {'enum': Object.values(ELEMENT_STATE)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.TEXT_ALIGNMENT},
				'type': propComparator,
				'val': {'enum': Object.values(TEXT_ALIGNMENT)},
			}},
			{'properties': {
				'name': {'const': ELEMENT_PROP.IMAGE_LOAD_STATE},
				'type': propComparator,
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
			'type': propComparator,
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
				'compare': propComparator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.METHOD},
				'val': {'enum': Object.values(NETWORK_METHOD)},
				'compare': propComparator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.BODY},
				'val': {'type': 'string'},
				'compare': propComparator,
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
				'compare': propComparator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.STATUS},
				'val': {'type': ['number', 'string']},
				'compare': propComparator,
			}},
			{'properties': {
				'name': {'const': NETWORK_PROP.BODY},
				'val': {'type': 'string'},
				'compare': propComparator,
			}},
		],
	},
};

schemas[validationKeys.TEST_LAUNCHER_TOKEN] = {
	'type': 'object',
	'required': ['tokenId', 'tokenPassword'],
	'properties': {
		'tokenId': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
		'presets': {
			'type': 'object',
			'additionalProperties': {
				'type': 'object',
				'properties': {
					'device': {
						'oneOf': [
							{'type': 'string'},
							{
								'type': 'object',
								'properties': {
									'deviceId': {'type': 'string'},
								},
								'additionalProperties': false,
							},
						],
					},
					'config': {
						'oneOf': [
							{'type': 'string'},
							{
								'type': 'object',
								'properties': {
									'configId': {'type': 'string'},
									...CONFIG_OVERRIDE_PROPERTIES,
								},
							},
						],
					},
				},
			},

		},
		'appConfigId': {'type': 'string'},
		'deviceId': {'type': 'string'},
	},
};

schemas[validationKeys.SESSION_BOOTSTRAP_TOKEN] = {
	'type': 'object',
	'required': ['tokenId'],
	'properties': {
		'tokenId': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
	},
};

schemas[validationKeys.CONFIGURE] = {
	'schemaId': validationKeys.CONFIGURE,
	'type': 'object',
	'additionalProperties': false,
	'properties': {
		'appConfigId': {'type': 'string'},
		'concurrency': {'type': 'number'},
		'overrideConfigFile': {'type': 'string'},
		'configFile': {'type': 'string'},
		'deviceId': {'type': 'string'},
		'disallowCrashReports': {'type': 'boolean'},
		'inspect': {'type': ['number', 'boolean', 'string']}, // --inspect=true evaluates to {inspect: 'true'}
		'inspectBrk': {'type': ['number', 'boolean', 'string']}, // same as above
		'logDir': {'type': 'string'},
		'defaultTimeout': {'type': 'number'},
		'logLevel': {'enum': ['silent', 'normal', 'verbose', 'debug', 'silly']},
		'orgId': {'type': 'string'},
		'repl': {'type': 'boolean'},
		'timestamp': {'type': 'string'},
		'tokenPassword': {'type': 'string'},
		'tokenId': {'type': 'string'},
		'preset': {
			'type': 'array',
			'items': {'type': 'string'},
		},
		'presets': {'type': 'object'},
		'screenshotDir': {'type': 'string'},
		'includeChangelist': {'type': 'boolean'},
		'recordingOption': {'type': 'string'},
		'webhookUrl': {'type': 'string'},
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

schemas[validationKeys.TAP_TYPE] = {
	'schemaId': validationKeys.TAP_TYPE,
	'enum': [TAP_TYPES.SINGLE, TAP_TYPES.DOUBLE, TAP_TYPES.LONG],
};

schemas[validationKeys.DIRECTIONS] = {
	'schemaId': validationKeys.DIRECTIONS,
	'enum': [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT],
};

schemas[validationKeys.CSS_PROPS] = {
	'schemaId': validationKeys.CSS_PROPS,
	'type': 'array',
	'minItems': 1,
	'items': {
		'type': 'string',
		'minLength': 1,
	},
};

schemas[validationKeys.ELEMENT_HANDLE] = {
	'schemaId': validationKeys.ELEMENT_HANDLE,
	'oneOf': [
		{'type': 'boolean'},
		{
			'type': 'object',
			'properties': {
				'multiple': {
					'type': 'boolean',
				},
			},
		},
	],
};

schemas[validationKeys.ELEMENT_ATTRIBUTES] = {
	'schemaId': validationKeys.ELEMENT_ATTRIBUTES,
	'type': 'array',
	'items': {
		'type': 'string',
		'minLength': 1,
	},
};

schemas[validationKeys.COOKIE_PROPS] = {
	'schemaId': validationKeys.COOKIE_PROPS,
	'type': 'array',
	'items': {
		'type': 'object',
		'required': ['property', 'val'],
		'anyOf': [
			{
				'properties': {
					'property': {
						'type': 'string',
						'enum': [COOKIE_PROP.VALUE, COOKIE_PROP.PATH, COOKIE_PROP.DOMAIN],
					},
					'val': {'type': 'string'},
					'type': stringComparators(),
				},
			},
			{
				'properties': {
					'property': {
						'type': 'string',
						'enum': [COOKIE_PROP.HTTP_ONLY, COOKIE_PROP.SECURE],
					},
					'val': {'type': 'boolean'},
					'type': booleanComparators(),
				},
			},
		],
	},
};

Object.freeze(schemas);

module.exports = schemas;
