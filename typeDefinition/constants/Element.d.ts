/**
 * Elements related constants
 */

// Element properties to check against
export type ElementPropTypes = {
	ALPHA:                     'alpha',
	AUTOMATION_ID:             'automationId',
	AUTOMATION_NAME:           'automationName',
	BG_COLOR:                  'backgroundColor',
	BORDER_COLOR:              'borderColor',
	BORDER_STYLE:              'borderStyle',
	BORDER_WIDTH:              'borderWidth',
	CLASS:                     'class',
	CONTENT_DESCRIPTION:       'contentDescription',
	FOCUS_MARGIN:              'focusMargin',
	FOCUS_PRIMARY_COLOR:       'focusPrimaryColor',
	FOCUS_PRIMARY_WIDTH:       'focusPrimaryWidth',
	FOCUS_SECONDARY_COLOR:     'focusSecondaryColor',
	FOCUS_SECONDARY_WIDTH:     'focusSecondaryWidth',
	FONT_SIZE:                 'fontSize',
	FONT_FAMILY:               'fontFamily',
	FONT_URI:                  'fontURI',
	FONT_WEIGHT:               'fontWeight',
	HAS_FOCUS:                 'hasFocus',
	HEIGHT:                    'height',
	HINT:                      'hint',
	HREF:                      'href',
	ID:                        'id',
	IS_CHECKED:                'isChecked',
	IS_CLICKABLE:              'isClickable',
	IS_COMPLETELY_DISPLAYED:   'isCompletelyDisplayed',
	IS_ENABLED:                'isEnabled',
	IS_FOCUSABLE:              'isFocusable',
	IS_SELECTED:               'isSelected',
	IS_TOUCHABLE:              'isTouchable',
	IMAGE:                     'image',
	ITEM_FOCUSED:              'itemFocused',
	LEFT:                      'left',
	MARGIN:                    'margin',
	NAME:                      'name',
	OPACITY:                   'opacity',
	PACKAGE_NAME:              'packageName',
	PADDING:                   'padding',
	PIVOT_X:                   'pivotX',
	PIVOT_Y:                   'pivotY',
	SCALE_X:                   'scaleX',
	SCALE_Y:                   'scaleY',
	TAG:                       'tag',
	TEXT_COLOR:                'color',
	TEXT_CONTENT:              'text',
	TEXT_SIZE:                 'textSize',
	TOP:                       'top',
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
	ACCESSIBILITY_IDENTIFIER:  'accessibilityIdentifier',
	BAR_TINT_COLOR:            'barTintColor',
	CONTENT_MODE:              'contentMode',
	IMAGE_HASH:                'imageHash',
	FONT_NAME:                 'fontName',
	HAS_META_DATA:             'hasMetaData',
	HAS_NAV_MARKERS:           'hasNavMarkers',
	IS_FOCUSED:                'isFocused',
	IS_OPAQUE:                 'isOpaque',
	NUMBER_OF_SEGMENTS:        'numberOfSegments',
	PLACEHOLDER:               'placeholder',
	PROPOSAL_URL:              'proposalUrl',
	SELECTED_IMAGE_TINT_COLOR: 'selectedImageTintColor',
	STATE:                     'state',
	TEXT_ALIGNMENT:            'textAlignment',
	LEFT_ABSOLUTE:             'leftAbsolute',
	TAG_INT:                   'tagInt',
	TINT_COLOR:                'tintColor',
	TOP_ABSOLUTE:              'topAbsolute',
};

// Element properties comparators
export type PropComparators = {
	EQUAL:         '=',
	NOT_EQUAL:     '!=',
	APPROX:        '+-',
	CONTAIN:       '~',
	NOT_CONTAIN:   '!~',
	GREATER:       '>',
	EQUAL_GREATER: '>=',
	LESSER:        '<',
	EQUAL_LESSER:  '<=',
	START:         '^',
	NOT_START:     '!^',
	END:           '$',
	NOT_END:       '!$',
};

// Element special values
export type ValueTypes = {REPO: symbol};
