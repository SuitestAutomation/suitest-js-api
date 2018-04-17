import {
	AbstractChain,
	Timeout,
	Equalable,
	BaseChain,
	WasMadeModifier,
	WillMadeModifier,
	RequestMatchesModifier,
	ResponseMatchesModifier,
} from './modifiers';

export interface NetworkRequestChain extends
	NetworkRequestEvalChain<NetworkRequestChain>,
	Equalable<NetworkRequestMadeChain>,
	NetworkRequestMadeModifiers<NetworkRequestEqualChain>,
	Timeout<NetworkRequestEmptyChain>
{}

interface NetworkRequestEqualChain extends
	NetworkRequestEvalChain<NetworkRequestMadeChain>,
	Equalable<NetworkRequestEmptyChain>
{}

interface NetworkRequestMadeChain extends
	NetworkRequestEvalChain<NetworkRequestMadeChain>,
	NetworkRequestMadeModifiers<NetworkRequestEmptyChain>
{}

interface NetworkRequestMadeModifiers<T> extends
	WasMadeModifier<T>, WillMadeModifier<T>
{}

interface NetworkRequestEvalChain<T> extends
	BaseChain<T, NetworkRequestEvalResult, NetworkRequestAbandonedChain>,
	ResponseMatchesModifier<T>,
	RequestMatchesModifier<T>
{}

interface NetworkRequestEmptyChain extends
	BaseChain<NetworkRequestEmptyChain, NetworkRequestEvalResult, NetworkRequestAbandonedChain>
{}

interface NetworkRequestAbandonedChain extends AbstractChain {}

type NetworkRequestEvalResult = boolean;
