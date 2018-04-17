import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface PollUrlChain extends
	BaseChain<PollUrlChain, PollUrlEvalResult, PollUrlAbandonedChain>
{}

interface PollUrlAbandonedChain extends AbstractChain {}

type PollUrlEvalResult = void;
