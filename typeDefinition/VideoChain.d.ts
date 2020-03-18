import {
	AbstractChain,
	Negatable,
	MatchJSModifiers,
	// MatchBrightScriptModifiers,
	ExistsModifiers,
	ElementMatchModifiers,
	Timeout,
	Intervalable,
	BaseChain,
	UntilModifier,
	VisibleModifier,
	VideoStateModifiers,
} from './modifiers';
import {ElementProps} from "./constants/ElementProps";

export interface VideoChain extends
	VideoBaseQueryChain<VideoChain>,
	Negatable<VideoWithoutNegation>, // not, doesNot, isNot
	Timeout<VideoWithoutTimeout>, // timeout
	VideoEvalModifiers<VideoWithoutEvalChain>,
	VisibleModifier<VideoWithoutEvalChain>
{}

// -matchers +timeout +negation
interface VideoWithoutEvalChain extends
	VideoBaseEvalChain<VideoWithoutEvalChain>,
	Timeout<VideoNegationChain>
{}

// +mathces -timeout +negation
interface VideoWithoutTimeout extends
	VideoBaseQueryChain<VideoWithoutTimeout>,
	Negatable<VideoEvalChain>,
	VideoEvalModifiers<VideoNegationChain>
{}

// +mathces +timeout -negation
interface VideoWithoutNegation extends
	VideoBaseEvalChain<VideoWithoutNegation>,
	Timeout<VideoEvalChain>,
	VideoEvalModifiersWithNegation<VideoTimeoutChain>
{}

// +matchers -timeout -negation
interface VideoEvalChain extends
	VideoBaseEvalChain<VideoEvalChain>,
	VideoEvalModifiers<VideoEmptyChain>
{}

// -matchers +timeout -negation
interface VideoTimeoutChain extends
	VideoBaseEvalChain<VideoTimeoutChain>,
	Timeout<VideoEmptyChain>
{}

// -matchers -timeout +negation
interface VideoNegationChain extends
	VideoBaseEvalChain<VideoNegationChain>
{}

// -matchers -timeout -negation
interface VideoEmptyChain extends
	VideoBaseEvalChain<VideoEmptyChain>
{}

interface VideoEvalModifiers<T> extends
	VideoStateModifiers<T>,
	MatchJSModifiers<T>,
	// MatchBrightScriptModifiers<T>,
	ExistsModifiers<T>,
	ElementMatchModifiers<T>
{}

interface VideoEvalModifiersWithNegation<T> extends
	ExistsModifiers<T>
{}

interface VideoBaseQueryChain<TSelf> extends
	BaseChain<TSelf, VideoQueryResult, VideoAbandonedChain>
{}

// base interface with then method
interface VideoBaseEvalChain<TSelf> extends
	BaseChain<TSelf, VideoEvalResult, VideoAbandonedChain>
{}

interface VideoAbandonedChain extends AbstractChain {}

type VideoQueryResult = ElementProps | void;
type VideoEvalResult = boolean | void;
