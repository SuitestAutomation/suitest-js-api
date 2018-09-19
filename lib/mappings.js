/* eslint-disable max-len*/

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

// vrc
const VRC = {};

VRC[VRC[vrcConstants.UP] = 'UP'] = vrcConstants.UP;
VRC[VRC[vrcConstants.DOWN] = 'DOWN'] = vrcConstants.DOWN;
VRC[VRC[vrcConstants.LEFT] = 'LEFT'] = vrcConstants.LEFT;
VRC[VRC[vrcConstants.RIGHT] = 'RIGHT'] = vrcConstants.RIGHT;
VRC[VRC[vrcConstants.OK] = 'OK'] = vrcConstants.OK;
VRC[VRC[vrcConstants.BACK] = 'BACK'] = vrcConstants.BACK;
VRC[VRC[vrcConstants.RED] = 'RED'] = vrcConstants.RED;
VRC[VRC[vrcConstants.GREEN] = 'GREEN'] = vrcConstants.GREEN;
VRC[VRC[vrcConstants.YELLOW] = 'YELLOW'] = vrcConstants.YELLOW;
VRC[VRC[vrcConstants.BLUE] = 'BLUE'] = vrcConstants.BLUE;
VRC[VRC[vrcConstants.NUM_0] = '0'] = vrcConstants.NUM_0;
VRC[VRC[vrcConstants.NUM_1] = '1'] = vrcConstants.NUM_1;
VRC[VRC[vrcConstants.NUM_2] = '2'] = vrcConstants.NUM_2;
VRC[VRC[vrcConstants.NUM_3] = '3'] = vrcConstants.NUM_3;
VRC[VRC[vrcConstants.NUM_4] = '4'] = vrcConstants.NUM_4;
VRC[VRC[vrcConstants.NUM_5] = '5'] = vrcConstants.NUM_5;
VRC[VRC[vrcConstants.NUM_6] = '6'] = vrcConstants.NUM_6;
VRC[VRC[vrcConstants.NUM_7] = '7'] = vrcConstants.NUM_7;
VRC[VRC[vrcConstants.NUM_8] = '8'] = vrcConstants.NUM_8;
VRC[VRC[vrcConstants.NUM_9] = '9'] = vrcConstants.NUM_9;
VRC[VRC[vrcConstants.FAST_FWD] = 'FAST_FWD'] = vrcConstants.FAST_FWD;
VRC[VRC[vrcConstants.REWIND] = 'REWIND'] = vrcConstants.REWIND;
VRC[VRC[vrcConstants.STOP] = 'STOP'] = vrcConstants.STOP;
VRC[VRC[vrcConstants.PLAY] = 'PLAY'] = vrcConstants.PLAY;
VRC[VRC[vrcConstants.PAUSE] = 'PAUSE'] = vrcConstants.PAUSE;
VRC[VRC[vrcConstants.PLAY_PAUSE] = 'PLAY_PAUSE'] = vrcConstants.PLAY_PAUSE;
VRC[VRC[vrcConstants.RECORD] = 'RECORD'] = vrcConstants.RECORD;
VRC[VRC[vrcConstants.VOL_UP] = 'VOL_UP'] = vrcConstants.VOL_UP;
VRC[VRC[vrcConstants.VOL_DOWN] = 'VOL_DOWN'] = vrcConstants.VOL_DOWN;
VRC[VRC[vrcConstants.MUTE] = 'MUTE'] = vrcConstants.MUTE;
VRC[VRC[vrcConstants.SETTINGS] = 'SETTINGS'] = vrcConstants.SETTINGS;
VRC[VRC[vrcConstants.TELETEXT] = 'TELETEXT'] = vrcConstants.TELETEXT;
VRC[VRC[vrcConstants.MENU] = 'MENU'] = vrcConstants.MENU;
VRC[VRC[vrcConstants.SOURCE] = 'SOURCE'] = vrcConstants.SOURCE;
VRC[VRC[vrcConstants.SMART] = 'SMART'] = vrcConstants.SMART;
VRC[VRC[vrcConstants.GUIDE] = 'GUIDE'] = vrcConstants.GUIDE;
VRC[VRC[vrcConstants.EXIT] = 'EXIT'] = vrcConstants.EXIT;
VRC[VRC[vrcConstants.POWER] = 'POWER'] = vrcConstants.POWER;
VRC[VRC[vrcConstants.CH_UP] = 'CH_UP'] = vrcConstants.CH_UP;
VRC[VRC[vrcConstants.CH_DOWN] = 'CH_DOWN'] = vrcConstants.CH_DOWN;
VRC[VRC[vrcConstants.HOME] = 'HOME'] = vrcConstants.HOME;
// xBox-specific
VRC[VRC[vrcConstants.A] = 'A'] = vrcConstants.A;
VRC[VRC[vrcConstants.B] = 'B'] = vrcConstants.B;
VRC[VRC[vrcConstants.X] = 'X'] = vrcConstants.X;
VRC[VRC[vrcConstants.Y] = 'Y'] = vrcConstants.Y;
VRC[VRC[vrcConstants.LEFT_TRIGGER] = 'LEFT_TRIGGER'] = vrcConstants.LEFT_TRIGGER;
VRC[VRC[vrcConstants.RIGHT_TRIGGER] = 'RIGHT_TRIGGER'] = vrcConstants.RIGHT_TRIGGER;
VRC[VRC[vrcConstants.LEFT_BUMPER] = 'LEFT_BUMPER'] = vrcConstants.LEFT_BUMPER;
VRC[VRC[vrcConstants.RIGHT_BUMPER] = 'RIGHT_BUMPER'] = vrcConstants.RIGHT_BUMPER;
VRC[VRC[vrcConstants.LEFT_THUMBSTICK_LEFT] = 'LEFT_THUMBSTICK_LEFT'] = vrcConstants.LEFT_THUMBSTICK_LEFT;
VRC[VRC[vrcConstants.LEFT_THUMBSTICK_RIGHT] = 'LEFT_THUMBSTICK_RIGHT'] = vrcConstants.LEFT_THUMBSTICK_RIGHT;
VRC[VRC[vrcConstants.LEFT_THUMBSTICK_UP] = 'LEFT_THUMBSTICK_UP'] = vrcConstants.LEFT_THUMBSTICK_UP;
VRC[VRC[vrcConstants.LEFT_THUMBSTICK_DOWN] = 'LEFT_THUMBSTICK_DOWN'] = vrcConstants.LEFT_THUMBSTICK_DOWN;
VRC[VRC[vrcConstants.LEFT_THUMBSTICK_BUTTON] = 'LEFT_THUMBSTICK_BUTTON'] = vrcConstants.LEFT_THUMBSTICK_BUTTON;
VRC[VRC[vrcConstants.RIGHT_THUMBSTICK_LEFT] = 'RIGHT_THUMBSTICK_LEFT'] = vrcConstants.RIGHT_THUMBSTICK_LEFT;
VRC[VRC[vrcConstants.RIGHT_THUMBSTICK_RIGHT] = 'RIGHT_THUMBSTICK_RIGHT'] = vrcConstants.RIGHT_THUMBSTICK_RIGHT;
VRC[VRC[vrcConstants.RIGHT_THUMBSTICK_UP] = 'RIGHT_THUMBSTICK_UP'] = vrcConstants.RIGHT_THUMBSTICK_UP;
VRC[VRC[vrcConstants.RIGHT_THUMBSTICK_DOWN] = 'RIGHT_THUMBSTICK_DOWN'] = vrcConstants.RIGHT_THUMBSTICK_DOWN;
VRC[VRC[vrcConstants.RIGHT_THUMBSTICK_BUTTON] = 'RIGHT_THUMBSTICK_BUTTON'] = vrcConstants.RIGHT_THUMBSTICK_BUTTON;
VRC[VRC[vrcConstants.D_PAD_RIGHT] = 'D_PAD_RIGHT'] = vrcConstants.D_PAD_RIGHT;
VRC[VRC[vrcConstants.D_PAD_LEFT] = 'D_PAD_LEFT'] = vrcConstants.D_PAD_LEFT;
VRC[VRC[vrcConstants.D_PAD_DOWN] = 'D_PAD_DOWN'] = vrcConstants.D_PAD_DOWN;
VRC[VRC[vrcConstants.D_PAD_UP] = 'D_PAD_UP'] = vrcConstants.D_PAD_UP;
VRC[VRC[vrcConstants.VIEW] = 'VIEW'] = vrcConstants.VIEW;
// apple tv
VRC[VRC[vrcConstants.SELECT] = 'ENTER'] = vrcConstants.SELECT;

// element properties
const ELEMENT_PROP = {};

ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.AUTOMATION_ID] = 'automationId'] = elConstants.ELEMENT_PROP.AUTOMATION_ID;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.AUTOMATION_NAME] = 'automationName'] = elConstants.ELEMENT_PROP.AUTOMATION_NAME;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.BG_COLOR] = 'backgroundColor'] = elConstants.ELEMENT_PROP.BG_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.BORDER_COLOR] = 'borderColor'] = elConstants.ELEMENT_PROP.BORDER_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.BORDER_STYLE] = 'borderStyle'] = elConstants.ELEMENT_PROP.BORDER_STYLE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.BORDER_WIDTH] = 'borderWidth'] = elConstants.ELEMENT_PROP.BORDER_WIDTH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.CLASS] = 'class'] = elConstants.ELEMENT_PROP.CLASS;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FOCUS_MARGIN] = 'focusMargin'] = elConstants.ELEMENT_PROP.FOCUS_MARGIN;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FOCUS_PRIMARY_COLOR] = 'focusPrimaryColor'] = elConstants.ELEMENT_PROP.FOCUS_PRIMARY_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FOCUS_PRIMARY_WIDTH] = 'focusPrimaryWidth'] = elConstants.ELEMENT_PROP.FOCUS_PRIMARY_WIDTH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FOCUS_SECONDARY_COLOR] = 'focusSecondaryColor'] = elConstants.ELEMENT_PROP.FOCUS_SECONDARY_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FOCUS_SECONDARY_WIDTH] = 'focusSecondaryWidth'] = elConstants.ELEMENT_PROP.FOCUS_SECONDARY_WIDTH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FONT_SIZE] = 'fontSize'] = elConstants.ELEMENT_PROP.FONT_SIZE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FONT_FAMILY] = 'fontFamily'] = elConstants.ELEMENT_PROP.FONT_FAMILY;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FONT_WEIGHT] = 'fontWeight'] = elConstants.ELEMENT_PROP.FONT_WEIGHT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HEIGHT] = 'height'] = elConstants.ELEMENT_PROP.HEIGHT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HREF] = 'href'] = elConstants.ELEMENT_PROP.HREF;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.ID] = 'id'] = elConstants.ELEMENT_PROP.ID;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IMAGE] = 'image'] = elConstants.ELEMENT_PROP.IMAGE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.LEFT] = 'left'] = elConstants.ELEMENT_PROP.LEFT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.MARGIN] = 'margin'] = elConstants.ELEMENT_PROP.MARGIN;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.NAME] = 'name'] = elConstants.ELEMENT_PROP.NAME;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PADDING] = 'padding'] = elConstants.ELEMENT_PROP.PADDING;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.OPACITY] = 'opacity'] = elConstants.ELEMENT_PROP.OPACITY;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TEXT_COLOR] = 'color'] = elConstants.ELEMENT_PROP.TEXT_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TEXT_CONTENT] = 'text'] = elConstants.ELEMENT_PROP.TEXT_CONTENT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TOP] = 'top'] = elConstants.ELEMENT_PROP.TOP;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.VIDEO_LENGTH] = 'videoLength'] = elConstants.ELEMENT_PROP.VIDEO_LENGTH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.VIDEO_POSITION] = 'videoPos'] = elConstants.ELEMENT_PROP.VIDEO_POSITION;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.VIDEO_STATE] = 'videoState'] = elConstants.ELEMENT_PROP.VIDEO_STATE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.VIDEO_URL] = 'videoUrl'] = elConstants.ELEMENT_PROP.VIDEO_URL;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.VISIBILITY] = 'visibility'] = elConstants.ELEMENT_PROP.VISIBILITY;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.WIDTH] = 'width'] = elConstants.ELEMENT_PROP.WIDTH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.Z_INDEX] = 'zIndex'] = elConstants.ELEMENT_PROP.Z_INDEX;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.ALPHA] = 'alpha'] = elConstants.ELEMENT_PROP.ALPHA;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.CONTENT_DESCRIPTION] = 'contentDescription'] = elConstants.ELEMENT_PROP.CONTENT_DESCRIPTION;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HAS_FOCUS] = 'hasFocus'] = elConstants.ELEMENT_PROP.HAS_FOCUS;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HINT] = 'hint'] = elConstants.ELEMENT_PROP.HINT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_CHECKED] = 'isChecked'] = elConstants.ELEMENT_PROP.IS_CHECKED;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_CLICKABLE] = 'isClickable'] = elConstants.ELEMENT_PROP.IS_CLICKABLE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_COMPLETELY_DISPLAYED] = 'isCompletelyDisplayed'] = elConstants.ELEMENT_PROP.IS_COMPLETELY_DISPLAYED;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_ENABLED] = 'isEnabled'] = elConstants.ELEMENT_PROP.IS_ENABLED;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_FOCUSABLE] = 'isFocusable'] = elConstants.ELEMENT_PROP.IS_FOCUSABLE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_SELECTED] = 'isSelected'] = elConstants.ELEMENT_PROP.IS_SELECTED;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_TOUCHABLE] = 'isTouchable'] = elConstants.ELEMENT_PROP.IS_TOUCHABLE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PACKAGE_NAME] = 'packageName'] = elConstants.ELEMENT_PROP.PACKAGE_NAME;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PIVOT_X] = 'pivotX'] = elConstants.ELEMENT_PROP.PIVOT_X;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PIVOT_Y] = 'pivotY'] = elConstants.ELEMENT_PROP.PIVOT_Y;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.SCALE_X] = 'scaleX'] = elConstants.ELEMENT_PROP.SCALE_X;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.SCALE_Y] = 'scaleY'] = elConstants.ELEMENT_PROP.SCALE_Y;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TAG] = 'tag'] = elConstants.ELEMENT_PROP.TAG;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TEXT_SIZE] = 'textSize'] = elConstants.ELEMENT_PROP.TEXT_SIZE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TRANSLATION_X] = 'translationX'] = elConstants.ELEMENT_PROP.TRANSLATION_X;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TRANSLATION_Y] = 'translationY'] = elConstants.ELEMENT_PROP.TRANSLATION_Y;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.ACCESSIBILITY_IDENTIFIER] = 'accessibilityIdentifier'] = elConstants.ELEMENT_PROP.ACCESSIBILITY_IDENTIFIER;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.BAR_TINT_COLOR] = 'barTintColor'] = elConstants.ELEMENT_PROP.BAR_TINT_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.CONTENT_MODE] = 'contentMode'] = elConstants.ELEMENT_PROP.CONTENT_MODE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IMAGE_HASH] = 'imageHash'] = elConstants.ELEMENT_PROP.IMAGE_HASH;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.FONT_NAME] = 'fontName'] = elConstants.ELEMENT_PROP.FONT_NAME;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HAS_META_DATA] = 'hasMetaData'] = elConstants.ELEMENT_PROP.HAS_META_DATA;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.HAS_NAV_MARKERS] = 'hasNavMarkers'] = elConstants.ELEMENT_PROP.HAS_NAV_MARKERS;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_FOCUSED] = 'isFocused'] = elConstants.ELEMENT_PROP.IS_FOCUSED;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.IS_OPAQUE] = 'isOpaque'] = elConstants.ELEMENT_PROP.IS_OPAQUE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PLACEHOLDER] = 'placeholder'] = elConstants.ELEMENT_PROP.PLACEHOLDER;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.PROPOSAL_URL] = 'proposalUrl'] = elConstants.ELEMENT_PROP.PROPOSAL_URL;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.SELECTED_IMAGE_TINT_COLOR] = 'selectedImageTintColor'] = elConstants.ELEMENT_PROP.SELECTED_IMAGE_TINT_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.STATE] = 'state'] = elConstants.ELEMENT_PROP.STATE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TEXT_ALIGNMENT] = 'textAlignment'] = elConstants.ELEMENT_PROP.TEXT_ALIGNMENT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.LEFT_ABSOLUTE] = 'leftAbsolute'] = elConstants.ELEMENT_PROP.LEFT_ABSOLUTE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TAG_INT] = 'tagInt'] = elConstants.ELEMENT_PROP.TAG_INT;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TINT_COLOR] = 'tintColor'] = elConstants.ELEMENT_PROP.TINT_COLOR;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.TOP_ABSOLUTE] = 'topAbsolute'] = elConstants.ELEMENT_PROP.TOP_ABSOLUTE;
ELEMENT_PROP[ELEMENT_PROP[elConstants.ELEMENT_PROP.NUMBER_OF_SEGMENTS] = 'numberOfSegments'] = elConstants.ELEMENT_PROP.NUMBER_OF_SEGMENTS;

// video states
const VIDEO_STATE = {};

VIDEO_STATE[VIDEO_STATE[videoStates.STOPPED] = 'stopped'] = videoStates.STOPPED;
VIDEO_STATE[VIDEO_STATE[videoStates.ERROR] = 'error'] = videoStates.ERROR;
VIDEO_STATE[VIDEO_STATE[videoStates.PLAYING] = 'playing'] = videoStates.PLAYING;
VIDEO_STATE[VIDEO_STATE[videoStates.PAUSED] = 'paused'] = videoStates.PAUSED;
VIDEO_STATE[VIDEO_STATE[videoStates.CONNECTING] = 'connecting'] = videoStates.CONNECTING;
VIDEO_STATE[VIDEO_STATE[videoStates.BUFFERING] = 'buffering'] = videoStates.BUFFERING;
VIDEO_STATE[VIDEO_STATE[videoStates.FINISHED] = 'finished'] = videoStates.FINISHED;
VIDEO_STATE[VIDEO_STATE[videoStates.IDLE] = 'idle'] = videoStates.IDLE;
VIDEO_STATE[VIDEO_STATE[videoStates.PREPARING] = 'preparing'] = videoStates.PREPARING;
VIDEO_STATE[VIDEO_STATE[videoStates.PREPARED] = 'prepared'] = videoStates.PREPARED;
VIDEO_STATE[VIDEO_STATE[videoStates.PLAYBACK_COMPLETED] = 'playback_completed'] = videoStates.PLAYBACK_COMPLETED;
VIDEO_STATE[VIDEO_STATE[videoStates.UNKNOWN] = 'unknown'] = videoStates.UNKNOWN;
VIDEO_STATE[VIDEO_STATE[videoStates.REVERSING] = 'reversing'] = videoStates.REVERSING;

// visibility states
const VISIBILITY_STATE = {};

VISIBILITY_STATE[VISIBILITY_STATE[visibilityStates.VISIBLE] = 'visible'] = visibilityStates.VISIBLE;
VISIBILITY_STATE[VISIBILITY_STATE[visibilityStates.INVISIBLE] = 'invisible'] = visibilityStates.INVISIBLE;
VISIBILITY_STATE[VISIBILITY_STATE[visibilityStates.GONE] = 'collapsed'] = visibilityStates.GONE;
VISIBILITY_STATE[VISIBILITY_STATE[visibilityStates.COLLAPSED] = 'collapsed'] = visibilityStates.COLLAPSED;

// border styles for apple tv
const BORDER_STYLE = {};

BORDER_STYLE[BORDER_STYLE[borderStyles.BEZEL] = 'bezel'] = borderStyles.BEZEL;
BORDER_STYLE[BORDER_STYLE[borderStyles.NONE] = 'none'] = borderStyles.NONE;
BORDER_STYLE[BORDER_STYLE[borderStyles.RECTANGLE] = 'rectangle'] = borderStyles.RECTANGLE;
BORDER_STYLE[BORDER_STYLE[borderStyles.ROUNDED] = 'rounded'] = borderStyles.ROUNDED;
// border style for hbbtv and browsers
BORDER_STYLE[BORDER_STYLE[borderStyles.HIDDEN] = 'hidden'] = borderStyles.HIDDEN;
BORDER_STYLE[BORDER_STYLE[borderStyles.DOTTED] = 'dotted'] = borderStyles.DOTTED;
BORDER_STYLE[BORDER_STYLE[borderStyles.DASHED] = 'dashed'] = borderStyles.DASHED;
BORDER_STYLE[BORDER_STYLE[borderStyles.SOLID] = 'solid'] = borderStyles.SOLID;
BORDER_STYLE[BORDER_STYLE[borderStyles.DOUBLE] = 'double'] = borderStyles.DOUBLE;
BORDER_STYLE[BORDER_STYLE[borderStyles.GROOVE] = 'groove'] = borderStyles.GROOVE;
BORDER_STYLE[BORDER_STYLE[borderStyles.RIDGE] = 'ridge'] = borderStyles.RIDGE;
BORDER_STYLE[BORDER_STYLE[borderStyles.INSET] = 'inset'] = borderStyles.INSET;
BORDER_STYLE[BORDER_STYLE[borderStyles.OUTSET] = 'outset'] = borderStyles.OUTSET;
BORDER_STYLE[BORDER_STYLE[borderStyles.INITIAL] = 'initial'] = borderStyles.INITIAL;
BORDER_STYLE[BORDER_STYLE[borderStyles.INHERIT] = 'inherit'] = borderStyles.INHERIT;

// contentMode
const CONTENT_MODE = {};

CONTENT_MODE[CONTENT_MODE[contentModes.SCALE_TO_FILL] = 'scaleToFill'] = contentModes.SCALE_TO_FILL;
CONTENT_MODE[CONTENT_MODE[contentModes.SCALE_ASPECT_FIT] = 'scaleAspectFit'] = contentModes.SCALE_ASPECT_FIT;
CONTENT_MODE[CONTENT_MODE[contentModes.SCALE_ASPECT_FILL] = 'scaleAspectFill'] = contentModes.SCALE_ASPECT_FILL;
CONTENT_MODE[CONTENT_MODE[contentModes.REDRAW] = 'redraw'] = contentModes.REDRAW;
CONTENT_MODE[CONTENT_MODE[contentModes.CENTER] = 'center'] = contentModes.CENTER;
CONTENT_MODE[CONTENT_MODE[contentModes.TOP] = 'top'] = contentModes.TOP;
CONTENT_MODE[CONTENT_MODE[contentModes.BOTTOM] = 'bottom'] = contentModes.BOTTOM;
CONTENT_MODE[CONTENT_MODE[contentModes.BOTTOM_LEFT] = 'bottomLeft'] = contentModes.BOTTOM_LEFT;
CONTENT_MODE[CONTENT_MODE[contentModes.BOTTOM_RIGHT] = 'bottomRight'] = contentModes.BOTTOM_RIGHT;
CONTENT_MODE[CONTENT_MODE[contentModes.LEFT] = 'left'] = contentModes.LEFT;
CONTENT_MODE[CONTENT_MODE[contentModes.RIGHT] = 'right'] = contentModes.RIGHT;
CONTENT_MODE[CONTENT_MODE[contentModes.TOP_LEFT] = 'topLeft'] = contentModes.TOP_LEFT;
CONTENT_MODE[CONTENT_MODE[contentModes.TOP_RIGHT] = 'topRight'] = contentModes.TOP_RIGHT;

// apple tv text alignment
const TEXT_ALIGNMENT = {};

TEXT_ALIGNMENT[TEXT_ALIGNMENT[textAlignments.CENTER] = 'center'] = textAlignments.CENTER;
TEXT_ALIGNMENT[TEXT_ALIGNMENT[textAlignments.JUSTIFIED] = 'justified'] = textAlignments.JUSTIFIED;
TEXT_ALIGNMENT[TEXT_ALIGNMENT[textAlignments.LEFT] = 'left'] = textAlignments.LEFT;
TEXT_ALIGNMENT[TEXT_ALIGNMENT[textAlignments.NATURAL] = 'natural'] = textAlignments.NATURAL;
TEXT_ALIGNMENT[TEXT_ALIGNMENT[textAlignments.RIGHT] = 'right'] = textAlignments.RIGHT;

// applet tv states
const ELEMENT_STATE = {};

ELEMENT_STATE[ELEMENT_STATE[elementStates.SELECTED] = 'selected'] = elementStates.SELECTED;
ELEMENT_STATE[ELEMENT_STATE[elementStates.HIGHLIGHTED] = 'highlighted'] = elementStates.HIGHLIGHTED;
ELEMENT_STATE[ELEMENT_STATE[elementStates.DISABLED] = 'disabled'] = elementStates.DISABLED;
ELEMENT_STATE[ELEMENT_STATE[elementStates.NORMAL] = 'normal'] = elementStates.NORMAL;
ELEMENT_STATE[ELEMENT_STATE[elementStates.APPLICATION] = 'application'] = elementStates.APPLICATION;
ELEMENT_STATE[ELEMENT_STATE[elementStates.FOCUSED] = 'focused'] = elementStates.FOCUSED;
ELEMENT_STATE[ELEMENT_STATE[elementStates.RESERVED] = 'reserved'] = elementStates.RESERVED;

// element special values
const VALUE = {};

VALUE[VALUE[elConstants.VALUE.REPO] = 'valueRepo'] = elConstants.VALUE.REPO;

// element propertiy comparators
const PROP_COMPARATOR = {};

PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.EQUAL] = '='] = comparators.PROP_COMPARATOR.EQUAL;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.NOT_EQUAL] = '!='] = comparators.PROP_COMPARATOR.NOT_EQUAL;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.APPROX] = '+-'] = comparators.PROP_COMPARATOR.APPROX;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.CONTAIN] = '~'] = comparators.PROP_COMPARATOR.CONTAIN;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.NOT_CONTAIN] = '!~'] = comparators.PROP_COMPARATOR.NOT_CONTAIN;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.GREATER] = '>'] = comparators.PROP_COMPARATOR.GREATER;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.EQUAL_GREATER] = '>='] = comparators.PROP_COMPARATOR.EQUAL_GREATER;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.LESSER] = '<'] = comparators.PROP_COMPARATOR.LESSER;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.EQUAL_LESSER] = '<='] = comparators.PROP_COMPARATOR.EQUAL_LESSER;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.START] = '^'] = comparators.PROP_COMPARATOR.START;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.NOT_START] = '!^'] = comparators.PROP_COMPARATOR.NOT_START;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.END] = '$'] = comparators.PROP_COMPARATOR.END;
PROP_COMPARATOR[PROP_COMPARATOR[comparators.PROP_COMPARATOR.NOT_END] = '!$'] = comparators.PROP_COMPARATOR.NOT_END;

const SUBJ_COMPARATOR = {};

SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.EXIST] = 'exists'] = comparators.SUBJ_COMPARATOR.EXIST;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.HAS_EXITED] = 'hasExited'] = comparators.SUBJ_COMPARATOR.HAS_EXITED;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.EQUAL] = '='] = comparators.SUBJ_COMPARATOR.EQUAL;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.CONTAIN] = '~'] = comparators.SUBJ_COMPARATOR.CONTAIN;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.START_WITH] = '^'] = comparators.SUBJ_COMPARATOR.START_WITH;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.END_WITH] = '$'] = comparators.SUBJ_COMPARATOR.END_WITH;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.MATCH] = 'has'] = comparators.SUBJ_COMPARATOR.MATCH;
SUBJ_COMPARATOR[SUBJ_COMPARATOR[comparators.SUBJ_COMPARATOR.MATCH_JS] = 'matches'] = comparators.SUBJ_COMPARATOR.MATCH_JS;

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
// SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.HAS_EXITED] = 'has not exited'; // this is invalid combination
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.EQUAL] = 'does not equal';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.CONTAIN] = 'does not contain';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.START_WITH] = 'does not start with';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.END_WITH] = 'does not end with';
SUBJ_COMPARATOR_HR_N[comparators.SUBJ_COMPARATOR.MATCH] = 'does not match';

// Map network request types
const NETWORK_PROP = {};

NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.BODY] = '@body'] = network.NETWORK_PROP.BODY;
NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.METHOD] = '@method'] = network.NETWORK_PROP.METHOD;
NETWORK_PROP[NETWORK_PROP[network.NETWORK_PROP.STATUS] = '@status'] = network.NETWORK_PROP.STATUS;

const NETWORK_METHOD = {};

NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.GET] = 'GET'] = network.NETWORK_METHOD.GET;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.POST] = 'POST'] = network.NETWORK_METHOD.POST;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.PUT] = 'PUT'] = network.NETWORK_METHOD.PUT;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.HEAD] = 'HEAD'] = network.NETWORK_METHOD.HEAD;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.DELETE] = 'DELETE'] = network.NETWORK_METHOD.DELETE;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.CONNECT] = 'CONNECT'] = network.NETWORK_METHOD.CONNECT;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.OPTIONS] = 'OPTIONS'] = network.NETWORK_METHOD.OPTIONS;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.TRACE] = 'TRACE'] = network.NETWORK_METHOD.TRACE;
NETWORK_METHOD[NETWORK_METHOD[network.NETWORK_METHOD.PATCH] = 'PATCH'] = network.NETWORK_METHOD.PATCH;

const ELEMENT_VALUES = {};

ELEMENT_VALUES[elConstants.ELEMENT_PROP.BORDER_STYLE] = ELEMENT_VALUES['borderStyle'] = BORDER_STYLE;
ELEMENT_VALUES[elConstants.ELEMENT_PROP.VIDEO_STATE] = ELEMENT_VALUES['videoState'] = VIDEO_STATE;
ELEMENT_VALUES[elConstants.ELEMENT_PROP.VISIBILITY] = ELEMENT_VALUES['visibility'] = VISIBILITY_STATE;
ELEMENT_VALUES[elConstants.ELEMENT_PROP.STATE] = ELEMENT_VALUES['state'] = ELEMENT_STATE;
ELEMENT_VALUES[elConstants.ELEMENT_PROP.CONTENT_MODE] = ELEMENT_VALUES['contentMode'] = CONTENT_MODE;
ELEMENT_VALUES[elConstants.ELEMENT_PROP.TEXT_ALIGNMENT] = ELEMENT_VALUES['textAlignment'] = TEXT_ALIGNMENT;

const ENV_VARS = {};

ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_LOG_LEVEL] = 'logLevel'] = envVars.SUITEST_CONFIG_LOG_LEVEL;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS] = 'disallowCrashReports'] = envVars.SUITEST_CONFIG_DISALLOW_CRASH_REPORTS;
ENV_VARS[ENV_VARS[envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR] = 'continueOnFatalError'] = envVars.SUITEST_CONFIG_CONTINUE_ON_FATAL_ERROR;
ENV_VARS[ENV_VARS[envVars.SUITEST_REPL_MODE] = 'repl'] = envVars.SUITEST_REPL_MODE;

Object.freeze(ENV_VARS);

module.exports = {
	VRC,
	ELEMENT_PROP,
	VIDEO_STATE,
	VISIBILITY_STATE,
	BORDER_STYLE,
	CONTENT_MODE,
	TEXT_ALIGNMENT,
	ELEMENT_STATE: ELEMENT_STATE,
	ELEMENT_VALUES,
	PROP_COMPARATOR,
	VALUE,
	SUBJ_COMPARATOR,
	SUBJ_COMPARATOR_HR,
	SUBJ_COMPARATOR_HR_N,
	NETWORK_PROP,
	NETWORK_METHOD,
	ENV_VARS,
};
