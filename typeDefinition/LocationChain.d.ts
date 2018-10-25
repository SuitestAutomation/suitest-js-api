import {
	AbstractChain,
	Negatable,
	Timeout,
	StringModifiers,
	MatchJSModifiers,
	BaseChain,
} from './modifiers';


// +matchers +timeout +negation
export interface LocationChain extends
	LocationBaseQueryChain<LocationChain>,
	Negatable<LocationEvalTimeoutChain>,
	Timeout<LocationEvalNegationChain>,
	LocationEvalModifiers<LocationTimeoutNegationChain>
{}

// -matchers +timeout +negation
interface LocationTimeoutNegationChain extends
	LocationBaseEvalChain<LocationTimeoutNegationChain>,
	Negatable<LocationTimeoutChain>,
	Timeout<LocationNegationChain>
{}

// +matchers -timeout +negation
interface LocationEvalNegationChain extends
	LocationBaseEvalChain<LocationEvalNegationChain>,
	Negatable<LocationEvalChain>,
	LocationEvalModifiers<LocationNegationChain>
{}

// +matchers +timeout -negation
interface LocationEvalTimeoutChain extends
	LocationBaseEvalChain<LocationEvalTimeoutChain>,
	Timeout<LocationEvalChain>,
	LocationEvalModifiers<LocationTimeoutChain>
{}

// -matchers -timeout +negation
interface LocationNegationChain extends
	LocationBaseEvalChain<LocationNegationChain>,
	Negatable<LocationEmptyChain>
{}

// -matchers +timeout -negation
interface LocationTimeoutChain extends
	LocationBaseEvalChain<LocationTimeoutChain>,
	Timeout<LocationEmptyChain>
{}

// +matchers -timeout -negation
interface LocationEvalChain extends
	LocationBaseEvalChain<LocationEvalChain>,
	LocationEvalModifiers<LocationEmptyChain>
{}

// -matchers -timeout -negation
interface LocationEmptyChain extends LocationBaseEvalChain<LocationEmptyChain> {}

interface LocationBaseQueryChain<TSelf> extends
	BaseChain<TSelf, LocationQueryResult, LocationAbandonedChain>
{}

interface LocationBaseEvalChain<TSelf> extends
	BaseChain<TSelf, LocationEvalResult, LocationAbandonedChain>
{}


interface LocationEvalModifiers<T> extends
	StringModifiers<T>,
	MatchJSModifiers<T>
{}

interface LocationAbandonedChain extends
	AbstractChain
{}

type LocationQueryResult = string;
type LocationEvalResult = boolean | void;
