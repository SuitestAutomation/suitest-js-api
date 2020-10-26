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
const imageLoadState = require('./constants/imageLoadState');
const borderStyles = require('./constants/borderStyle');

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
	IMAGE_LOAD_STATE: {...imageLoadState},
	ELEMENT_STATE: {...elementStates},
	ELEMENT_VALUES: {...elConstants.ELEMENT_VALUES},
	PROP_COMPARATOR: {...comparators.PROP_COMPARATOR},
	VALUE,
	SUBJ_COMPARATOR: {...comparators.SUBJ_COMPARATOR},
	NETWORK_PROP,
	NETWORK_METHOD: {...network.NETWORK_METHOD},
};

module.exports = allMappings;
