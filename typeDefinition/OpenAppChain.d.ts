import {
	AbstractChain,
	BaseChain,
	LaunchModeModifier,
	DeepLinkModifier,
} from './modifiers';

export interface OpenAppChain extends
	BaseChain<OpenAppChain, OpenAppEvalResult, OpenAppAbandonedChain>,
	LaunchModeModifier<OpenAppChain>,
	DeepLinkModifier<OpenAppChain>
{}

interface OpenAppAbandonedChain extends AbstractChain {}

type OpenAppEvalResult = undefined | boolean;
