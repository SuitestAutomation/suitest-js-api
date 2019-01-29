/* eslint-disable max-len */

const vrcConstants = require('./constants/vrc');
const elConstants = require('./constants/element');
const videoStates = require('./constants/videoState');
const visibilityStates = require('./constants/visibilityState');
const comparators = require('./constants/comparator');
const network = require('./constants/networkRequest');
const contentModes = require('./constants/contentMode');
const elementStates = require('./constants/elementState');
const textAlignments = require('./constants/textAlignment');
const borderStyles = require('./constants/borderStyle');
const envVars = require('./constants/enviroment');

// Map to human readable format
const SUBJ_COMPARATOR_HR = {};

SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.EXIST] = 'exists';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.HAS_EXITED] = 'has exited';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.EQUAL] = 'equals';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.CONTAIN] = 'contains';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.START_WITH] = 'starts with';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.END_WITH] = 'ends with';
SUBJ_COMPARATOR_HR[comparators.SUBJ_COMPARATOR.MATCH] = 'matches';

Object.freeze(SUBJ_COMPARATOR_HR);

// Map to negated human readable format
const SUBJ_COMPARATOR_HR_N = {};

SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.EXIST] = 'does not exist';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.EQUAL] = 'does not equal';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.CONTAIN] = 'does not contain';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.START_WITH] = 'does not start with';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.END_WITH] = 'does not end with';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.MATCH] = 'does not match';

const ENV_VARS = {};

ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_DEFAULT_TIMEOUT] = 'defaultTimeout'] = envVars.SUITEST_CONFIG_DEFAULT_TIMEOUT;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_LOG_LEVEL] = 'logLevel'] = envVars.SUITEST_CONFIG_LOG_LEVEL;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = 'disallowCrashReports'] = envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = 'continueOnFatalError'] = envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_LOG_DIR] = 'logDir'] = envVars.SUITEST_CONFIG_LOG_DIR;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_TIMESTAMP] = 'timestamp'] = envVars.SUITEST_CONFIG_TIMESTAMP;

Object.freeze(ENV_VARS);

// Map network request types
const NETWORK_PROP = {};

NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.BODY] = '@body'] = network.NETWORK_PROP.BODY;
NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.METHOD] = '@method'] = network.NETWORK_PROP.METHOD;
NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.STATUS] = '@status'] = network.NETWORK_PROP.STATUS;

// element special values
const VALUE = {};

VALUE[VALUE[elConstants.VALUE.REPO] = 'valueRepo'] = elConstants.VALUE.REPO;

const allMappings = {
	VRC: {...vrcConstants},
	ELEMENT_PROP: {...elConstants.ELEMENT_PROP},
	VIDEO_STATE: {...videoStates},
	VISIBILITY_STATE: {...visibilityStates},
	BORDER_STYLE: {...borderStyles},
	CONTENT_MODE: {...contentModes},
	TEXT_ALIGNMENT: {...textAlignments},
	ELEMENT_STATE: {...elementStates},
	ELEMENT_VALUES: {...elConstants.ELEMENT_VALUES},
	PROP_COMPARATOR: {...comparators.PROP_COMPARATOR},
	VALUE,
	SUBJ_COMPARATOR: {...comparators.SUBJ_COMPARATOR},
	SUBJ_COMPARATOR_HR,
	SUBJ_COMPARATOR_HR_N,
	NETWORK_PROP,
	NETWORK_METHOD: {...network.NETWORK_METHOD},
	ENV_VARS,
};

module.exports = allMappings;
