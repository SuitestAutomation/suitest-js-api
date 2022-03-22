import {
	AbstractChain,
	BaseChain,
	LaunchModeModifier
} from './modifiers';

export interface OpenAppChain extends
	BaseChain<OpenAppChain, OpenAppEvalResult, OpenAppAbandonedChain>,
	LaunchModeModifier<OpenAppChain>
{}

interface OpenAppAbandonedChain extends AbstractChain {}

type OpenAppEvalResult = void | boolean;
