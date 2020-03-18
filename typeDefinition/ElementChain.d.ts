import {
	AbstractChain,
	Negatable,
	MatchJSModifiers,
	// MatchBrightScriptModifiers,
	ExistsModifiers,
	ElementMatchModifiers,
	Timeout,
	Clickable,
	SendTextModifier,
	SetTextModifier,
	MoveToModifier,
	Repeatable,
	Intervalable,
	BaseChain,
	UntilModifier,
	VisibleModifier,
	VideoStateModifiers,
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
	MoveToModifier<ElementEmptyChain>, // moveTo
	VisibleModifier<ElementWithoutEvalChain>
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

interface ElementEvalModifiersWithNegation<T> extends
	ExistsModifiers<T>
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
