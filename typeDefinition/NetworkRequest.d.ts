import {
	AbstractChain,
	Timeout,
	Equalable,
	Containable,
	Negatable,
	BaseChain,
	WasMadeModifier,
	WillMadeModifier,
	RequestMatchesModifier,
	ResponseMatchesModifier,
} from './modifiers';

export interface NetworkRequestChain extends
	Timeout<NetworkRequestChain>,
	Negatable<NetworkRequestChain>,
	Equalable<NetworkRequestChain>,
	Containable<NetworkRequestChain>,
	NetworkRequestMadeModifiers<NetworkRequestChain>,
	NetworkRequestEvalChain<NetworkRequestChain>
{}

interface NetworkRequestMadeModifiers<T> extends
	WasMadeModifier<T>, WillMadeModifier<T>
{}

interface NetworkRequestEvalChain<T> extends
	BaseChain<T, NetworkRequestEvalResult, NetworkRequestAbandonedChain>,
	ResponseMatchesModifier<T>,
	RequestMatchesModifier<T>
{}

interface NetworkRequestAbandonedChain extends AbstractChain {}

type NetworkRequestEvalResult = boolean | void;
