import {
	AbstractChain,
	Negatable,
	MatchJSModifiers,
	// MatchBrightScriptModifiers,
	ExistsModifiers,
	ElementMatchModifiers,
	Timeout,
	Clickable,
	TapModifier,
	ScrollModifier,
	SwipeModifier,
	SendTextModifier,
	SetTextModifier,
	MoveToModifier,
	Repeatable,
	Intervalable,
	BaseEmptyChain,
	BaseChain,
	UntilModifier,
	VisibleModifier,
	VideoStateModifiers,
	GetCssModifiers,
	HandleModifier,
	GetAttributesModifier,
} from './modifiers';
import {ElementProps} from "./constants/ElementProps";

export interface ElementChain extends
	ElementBaseQueryChain<ElementChain>,
	Negatable<ElementWithoutNegation>, // not, doesNot, isNot
	Timeout<ElementWithoutTimeout>, // timeout
	ElementEvalModifiers<ElementWithoutEvalChain>,
	SendTextModifier<ElementRepeatIntervalChain>, // sendText
	SetTextModifier<ElementEmptyChain>, // setText
	Clickable<ElementRepeatIntervalChain>, // click
	TapModifier<ElementRepeatIntervalChain>, // tap
	ScrollModifier<ElementRepeatIntervalChain>, // scroll
	SwipeModifier<ElementRepeatIntervalChain>, // swipe
	MoveToModifier<ElementEmptyChain>, // moveTo
	VisibleModifier<ElementWithoutEvalChain>,// visible
	GetCssModifiers<ElementGetPropertiesChain>, // getCssProperties
	HandleModifier<ElementHandleChain>, // handle
	GetAttributesModifier<ElementGetAttributesChain> // getAttributes
{}

// -matchers +timeout +negation
interface ElementWithoutEvalChain extends
	ElementBaseEvalChain<ElementWithoutEvalChain>,
	Timeout<ElementNegationChain>
{}

// +mathces -timeout +negation
interface ElementWithoutTimeout extends
	ElementBaseQueryChain<ElementWithoutTimeout>,
	Negatable<ElementEvalChain>,
	ElementEvalModifiers<ElementNegationChain>
{}

// +mathces +timeout -negation
interface ElementWithoutNegation extends
	ElementBaseEvalChain<ElementWithoutNegation>,
	Timeout<ElementEvalChain>,
	ElementEvalModifiersWithNegation<ElementTimeoutChain>
{}

// +matchers -timeout -negation
interface ElementEvalChain extends
	ElementBaseEvalChain<ElementEvalChain>,
	ElementEvalModifiers<ElementEmptyChain>
{}

// -matchers +timeout -negation
interface ElementTimeoutChain extends
	ElementBaseEvalChain<ElementTimeoutChain>,
	Timeout<ElementEmptyChain>
{}

// -matchers -timeout +negation
interface ElementNegationChain extends
	ElementBaseEvalChain<ElementNegationChain>
{}

// -matchers -timeout -negation
interface ElementEmptyChain extends
	ElementBaseEvalChain<ElementEmptyChain>
{}

// chain result for click, sendText
interface ElementRepeatIntervalChain extends
	ElementBaseEvalChain<ElementRepeatIntervalChain>,
	UntilModifier<Repeatable<ElementIntervalChain> & Intervalable<ElementRepeatChain>>,
	Repeatable<ElementIntervalChain>,
	Intervalable<ElementRepeatChain>
{}

// -repeat +interval
interface ElementIntervalChain extends
	ElementBaseEvalChain<ElementIntervalChain>,
	Intervalable<ElementEmptyChain>
{}

// +repeat -interval
interface ElementRepeatChain extends
	ElementBaseEvalChain<ElementRepeatChain>,
	Repeatable<ElementEmptyChain>
{}

interface ElementEvalModifiers<T> extends
	VideoStateModifiers<T>,
	MatchJSModifiers<T>,
	// MatchBrightScriptModifiers<T>,
	ExistsModifiers<T>,
	ElementMatchModifiers<T>
{}

/*
 * @description represents return value of calling getCssProperties function.
 */
interface ElementGetPropertiesChain extends
	BaseEmptyChain<ElementGetPropertiesChain, Record<string, string>, ElementAbandonedChain>
{}

/*
 * @description represents return value of calling "handle" function.
 */
interface ElementHandleChain extends
	BaseEmptyChain<ElementHandleChain, string[], ElementAbandonedChain>
{}

/*
 * @description represents return value of calling "getAttributes" function.
 */
interface ElementGetAttributesChain extends
	BaseEmptyChain<ElementGetAttributesChain, Record<string, string>, ElementAbandonedChain>
{}

interface ElementEvalModifiersWithNegation<T> extends
	ExistsModifiers<T>,
	VisibleModifier<T>
{}

interface ElementBaseQueryChain<TSelf> extends
	BaseChain<TSelf, ElementQueryResult, ElementAbandonedChain>
{}

// base interface with then method
interface ElementBaseEvalChain<TSelf> extends
	BaseChain<TSelf, ElementEvalResult, ElementAbandonedChain>
{}

interface ElementAbandonedChain extends AbstractChain {}

type ElementQueryResult = ElementProps | void;
type ElementEvalResult = boolean | void;
