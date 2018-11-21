const BORDER_STYLE = require('../constants/borderStyle');
const VIDEO_STATE = require('../constants/videoState');
const VISIBILITY_STATE = require('../constants/visibilityState');
const CONTENT_MODE = require('../constants/contentMode');
const ELEMENT_STATE = require('../constants/elementState');
const TEXT_ALIGNMENT = require('../constants/textAlignment');
const {ELEMENT_PROP} = require('../constants/element');

const ELEMENT_PROP_TYPES = {
	[ELEMENT_PROP.ALPHA]: 'number',
	[ELEMENT_PROP.AUTOMATION_ID]: 'string',
	[ELEMENT_PROP.AUTOMATION_NAME]: 'string',
	[ELEMENT_PROP.BG_COLOR]: 'string',
	[ELEMENT_PROP.BORDER_COLOR]: 'string',
	[ELEMENT_PROP.BORDER_STYLE]: `enum [${Object.values(BORDER_STYLE).join(', ')}]`,
	[ELEMENT_PROP.BORDER_WIDTH]: 'string',
	[ELEMENT_PROP.CLASS]: 'string',
	[ELEMENT_PROP.CONTENT_DESCRIPTION]: 'string',
	[ELEMENT_PROP.FOCUS_MARGIN]: 'string',
	[ELEMENT_PROP.FOCUS_PRIMARY_COLOR]: 'string',
	[ELEMENT_PROP.FOCUS_PRIMARY_WIDTH]: 'string',
	[ELEMENT_PROP.FOCUS_SECONDARY_COLOR]: 'string',
	[ELEMENT_PROP.FOCUS_SECONDARY_WIDTH]: 'string',
	[ELEMENT_PROP.FONT_FAMILY]: 'string',
	[ELEMENT_PROP.FONT_NAME]: 'string',
	[ELEMENT_PROP.FONT_SIZE]: 'number',
	[ELEMENT_PROP.FONT_WEIGHT]: 'string',
	[ELEMENT_PROP.HAS_FOCUS]: 'boolean',
	[ELEMENT_PROP.HEIGHT]: 'number',
	[ELEMENT_PROP.HINT]: 'string',
	[ELEMENT_PROP.HREF]: 'string',
	[ELEMENT_PROP.ID]: 'string',
	[ELEMENT_PROP.IS_CHECKED]: 'boolean',
	[ELEMENT_PROP.IS_CLICKABLE]: 'boolean',
	[ELEMENT_PROP.IS_COMPLETELY_DISPLAYED]: 'boolean',
	[ELEMENT_PROP.IS_ENABLED]: 'boolean',
	[ELEMENT_PROP.IS_FOCUSABLE]: 'boolean',
	[ELEMENT_PROP.IS_SELECTED]: 'boolean',
	[ELEMENT_PROP.IS_TOUCHABLE]: 'boolean',
	[ELEMENT_PROP.IMAGE]: 'string',
	[ELEMENT_PROP.LEFT]: 'number',
	[ELEMENT_PROP.MARGIN]: 'string',
	[ELEMENT_PROP.NAME]: 'string',
	[ELEMENT_PROP.OPACITY]: 'integer',
	[ELEMENT_PROP.PACKAGE_NAME]: 'string',
	[ELEMENT_PROP.PADDING]: 'string',
	[ELEMENT_PROP.PIVOT_X]: 'number',
	[ELEMENT_PROP.PIVOT_Y]: 'number',
	[ELEMENT_PROP.SCALE_X]: 'number',
	[ELEMENT_PROP.SCALE_Y]: 'number',
	[ELEMENT_PROP.TAG]: 'string',
	[ELEMENT_PROP.TEXT_COLOR]: 'string',
	[ELEMENT_PROP.TEXT_CONTENT]: 'string',
	[ELEMENT_PROP.TEXT_SIZE]: 'number',
	[ELEMENT_PROP.TOP]: 'number',
	[ELEMENT_PROP.TRANSLATION_X]: 'number',
	[ELEMENT_PROP.TRANSLATION_Y]: 'number',
	[ELEMENT_PROP.VIDEO_LENGTH]: 'integer',
	[ELEMENT_PROP.VIDEO_POSITION]: 'integer',
	[ELEMENT_PROP.VIDEO_STATE]: `enum [${Object.values(VIDEO_STATE).join(', ')}]`,
	[ELEMENT_PROP.VIDEO_URL]: 'string',
	[ELEMENT_PROP.VISIBILITY]: `enum [${Object.values(VISIBILITY_STATE).join(', ')}]`,
	[ELEMENT_PROP.WIDTH]: 'number',
	[ELEMENT_PROP.Z_INDEX]: 'integer',
	[ELEMENT_PROP.ACCESSIBILITY_IDENTIFIER]: 'string',
	[ELEMENT_PROP.BAR_TINT_COLOR]: 'string',
	[ELEMENT_PROP.CONTENT_MODE]: `enum [${Object.values(CONTENT_MODE).join(', ')}]`,
	[ELEMENT_PROP.IMAGE_HASH]: 'string',
	[ELEMENT_PROP.HAS_META_DATA]: 'boolean',
	[ELEMENT_PROP.HAS_NAV_MARKERS]: 'boolean',
	[ELEMENT_PROP.IS_FOCUSED]: 'boolean',
	[ELEMENT_PROP.IS_OPAQUE]: 'boolean',
	[ELEMENT_PROP.NUMBER_OF_SEGMENTS]: 'integer',
	[ELEMENT_PROP.PLACEHOLDER]: 'string',
	[ELEMENT_PROP.PROPOSAL_URL]: 'string',
	[ELEMENT_PROP.WEB_VIEW_URL]: 'string',
	[ELEMENT_PROP.SELECTED_IMAGE_TINT_COLOR]: 'string',
	[ELEMENT_PROP.STATE]: `enum [${Object.values(ELEMENT_STATE).join(', ')}]`,
	[ELEMENT_PROP.TEXT_ALIGNMENT]: `enum [${Object.values(TEXT_ALIGNMENT).join(', ')}]`,
	[ELEMENT_PROP.LEFT_ABSOLUTE]: 'number',
	[ELEMENT_PROP.TAG_INT]: 'integer',
	[ELEMENT_PROP.TINT_COLOR]: 'string',
	[ELEMENT_PROP.TOP_ABSOLUTE]: 'number',
	[ELEMENT_PROP.NUMBER_OF_SEGMENTS]: 'integer',
};

Object.freeze(ELEMENT_PROP_TYPES);

// Create map by value type, eg: {'integer': [ELEMENT_PROP.WIDTH]}
const ELEMENT_PROP_BY_TYPE = Object.getOwnPropertyNames(ELEMENT_PROP_TYPES).reduce((map, s) => ({
	...map,
	[ELEMENT_PROP_TYPES[s]]: map[ELEMENT_PROP_TYPES[s]] ? [...map[ELEMENT_PROP_TYPES[s]], s] : [s],
}), {});

Object.freeze(ELEMENT_PROP_BY_TYPE);

module.exports = {
	ELEMENT_PROP_TYPES,
	ELEMENT_PROP_BY_TYPE,
};
