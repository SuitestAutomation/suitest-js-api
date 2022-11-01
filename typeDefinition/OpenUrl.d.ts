import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface OpenUrlChain extends
	BaseChain<OpenUrlChain, OpenUrlEvalResult, OpenUrlAbandonedChain>
{}

interface OpenUrlAbandonedChain extends AbstractChain {}

type OpenUrlEvalResult = undefined | boolean;
