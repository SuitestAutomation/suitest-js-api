import {
	AbstractChain,
	BaseChain,
	LaunchMode
} from './modifiers';

export interface OpenAppChain extends
	BaseChain<OpenAppChain, OpenAppEvalResult, OpenAppAbandonedChain>,
	LaunchMode<OpenAppChain>
{}

interface OpenAppAbandonedChain extends AbstractChain {}

type OpenAppEvalResult = void | boolean;
