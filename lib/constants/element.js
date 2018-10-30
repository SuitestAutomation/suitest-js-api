/* eslint-disable */

/**
 * Elements related constants
 */

// Element properties to check against
const ELEMENT_PROP = {
	ACCESSIBILITY_IDENTIFIER:  'accessibilityIdentifier',
	ALPHA:                     'alpha',
	AUTOMATION_ID:             'automationId',
	AUTOMATION_NAME:           'automationName',
	BAR_TINT_COLOR:            'barTintColor',
	BG_COLOR:                  'backgroundColor',
	BORDER_COLOR:              'borderColor',
	BORDER_STYLE:              'borderStyle',
	BORDER_WIDTH:              'borderWidth',
	CLASS:                     'class',
	CONTENT_DESCRIPTION:       'contentDescription',
	CONTENT_MODE:              'contentMode',
	FOCUS_MARGIN:              'focusMargin',
	FOCUS_PRIMARY_COLOR:       'focusPrimaryColor',
	FOCUS_PRIMARY_WIDTH:       'focusPrimaryWidth',
	FOCUS_SECONDARY_COLOR:     'focusSecondaryColor',
	FOCUS_SECONDARY_WIDTH:     'focusSecondaryWidth',
	FONT_FAMILY:               'fontFamily',
	FONT_SIZE:                 'fontSize',
	FONT_NAME:                 'fontName',
	FONT_URI:                  'fontURI',
	FONT_WEIGHT:               'fontWeight',
	HAS_FOCUS:                 'hasFocus',
	HAS_META_DATA:             'hasMetaData',
	HAS_NAV_MARKERS:           'hasNavMarkers',
	HEIGHT:                    'height',
	HINT:                      'hint',
	HREF:                      'href',
	ID:                        'id',
	IMAGE:                     'image',
	IMAGE_HASH:                'imageHash',
	IS_CHECKED:                'isChecked',
	IS_CLICKABLE:              'isClickable',
	IS_COMPLETELY_DISPLAYED:   'isCompletelyDisplayed',
	IS_ENABLED:                'isEnabled',
	IS_FOCUSABLE:              'isFocusable',
	IS_FOCUSED:                'isFocused',
	IS_OPAQUE:                 'isOpaque',
	IS_SELECTED:               'isSelected',
	IS_TOUCHABLE:              'isTouchable',
	ITEM_FOCUSED:              'itemFocused',
	LEFT:                      'left',
	LEFT_ABSOLUTE:             'leftAbsolute',
	MARGIN:                    'margin',
	NAME:                      'name',
	NUMBER_OF_SEGMENTS:        'numberOfSegments',
	OPACITY:                   'opacity',
	PACKAGE_NAME:              'packageName',
	PADDING:                   'padding',
	PIVOT_X:                   'pivotX',
	PIVOT_Y:                   'pivotY',
	PLACEHOLDER:               'placeholder',
	PROPOSAL_URL:              'proposalUrl',
	SCALE_X:                   'scaleX',
	SCALE_Y:                   'scaleY',
	SELECTED_IMAGE_TINT_COLOR: 'selectedImageTintColor',
	STATE:                     'state',
	TAG:                       'tag',
	TAG_INT:                   'tagInt',
	TEXT_ALIGNMENT:            'textAlignment',
	TEXT_COLOR:                'color',
	TEXT_CONTENT:              'text',
	TEXT_SIZE:                 'textSize',
	TINT_COLOR:                'tintColor',
	TOP:                       'top',
	TOP_ABSOLUTE:              'topAbsolute',
	TRANSLATION_X:             'translationX',
	TRANSLATION_Y:             'translationY',
	VALUE:                     'value',
	VIDEO_LENGTH:              'videoLength',
	VIDEO_POSITION:            'videoPosition',
	VIDEO_STATE:               'videoState',
	VIDEO_URL:                 'videoUrl',
	VISIBILITY:                'visibility',
	WIDTH:                     'width',
	Z_INDEX:                   'zIndex',
};

const VALUES = {
	BORDER_STYLE:     ELEMENT_PROP.BORDER_STYLE,
	VIDEO_STATE:      ELEMENT_PROP.VIDEO_STATE,
	VISIBILITY_STATE: ELEMENT_PROP.VISIBILITY_STATE,
	ELEMENT_STATE:    ELEMENT_PROP.ELEMENT_STATE,
	CONTENT_MODE:     ELEMENT_PROP.CONTENT_MODE,
	TEXT_ALIGNMENT:   ELEMENT_PROP.TEXT_ALIGNMENT,
};

Object.freeze(ELEMENT_PROP);
Object.freeze(VALUES);

// Element special values
const VALUE = {REPO: Symbol('valueRepo')};

Object.freeze(VALUE);

module.exports = {
	ELEMENT_PROP,
	VALUE,
	ELEMENT_VALUES: VALUES
};
