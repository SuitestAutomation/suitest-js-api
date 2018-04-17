/* eslint-disable key-spacing */

/**
 * Elements related constants
 */

// Element properties to check against
const ELEMENT_PROP = {
	ALPHA:                    Symbol('alpha'),
	AUTOMATION_ID:            Symbol('automationId'),
	AUTOMATION_NAME:          Symbol('automationName'),
	BG_COLOR:                 Symbol('backgroundColor'),
	BORDER_COLOR:             Symbol('borderColor'),
	BORDER_STYLE:             Symbol('borderStyle'),
	BORDER_WIDTH:             Symbol('borderWidth'),
	CLASS:                    Symbol('class'),
	CONTENT_DESCRIPTION:      Symbol('contentDescription'),
	FOCUS_MARGIN:             Symbol('focusMargin'),
	FOCUS_PRIMARY_COLOR:      Symbol('focusPrimaryColor'),
	FOCUS_PRIMARY_WIDTH:      Symbol('focusPrimaryWidth'),
	FOCUS_SECONDARY_COLOR:    Symbol('focusSecondaryColor'),
	FOCUS_SECONDARY_WIDTH:    Symbol('focusSecondaryWidth'),
	FONT_SIZE:                Symbol('fontSize'),
	FONT_FAMILY:              Symbol('fontFamily'),
	FONT_WEIGHT:              Symbol('fontWeight'),
	HAS_FOCUS:                Symbol('hasFocus'),
	HEIGHT:                   Symbol('height'),
	HINT:                     Symbol('hint'),
	HREF:                     Symbol('href'),
	ID:                       Symbol('id'),
	IS_CHECKED:               Symbol('isChecked'),
	IS_CLICKABLE:             Symbol('isClickable'),
	IS_COMPLETELY_DISPLAYED: Symbol('isCompletelyDisplayed'),
	IS_ENABLED:               Symbol('isEnabled'),
	IS_FOCUSABLE:             Symbol('isFocusable'),
	IS_SELECTED:              Symbol('isSelected'),
	IS_TOUCHABLE:             Symbol('isTouchable'),
	IMAGE:                    Symbol('image'),
	LEFT:                     Symbol('left'),
	MARGIN:                   Symbol('margin'),
	NAME:                     Symbol('name'),
	OPACITY:                  Symbol('opacity'),
	PACKAGE_NAME:             Symbol('packageName'),
	PADDING:                  Symbol('padding'),
	PIVOT_X:                  Symbol('pivotX'),
	PIVOT_Y:                  Symbol('pivotY'),
	SCALE_X:                  Symbol('scaleX'),
	SCALE_Y:                  Symbol('scaleY'),
	TAG:                      Symbol('tag'),
	TEXT_COLOR:               Symbol('color'),
	TEXT_CONTENT:             Symbol('text'),
	TEXT_SIZE:                Symbol('textSize'),
	TOP:                      Symbol('top'),
	TRANSLATION_X:            Symbol('translationX'),
	TRANSLATION_Y:            Symbol('translationY'),
	VIDEO_LENGTH:             Symbol('videoLength'),
	VIDEO_POSITION:           Symbol('videoPosition'),
	VIDEO_STATE:              Symbol('videoState'),
	VIDEO_URL:                Symbol('videoUrl'),
	VISIBILITY:               Symbol('visibility'),
	WIDTH:                    Symbol('width'),
	Z_INDEX:                  Symbol('zIndex'),
};

Object.freeze(ELEMENT_PROP);

// Element special values
const VALUE = {REPO: Symbol('valueRepo')};

Object.freeze(VALUE);

module.exports = {
	ELEMENT_PROP,
	VALUE,
};
