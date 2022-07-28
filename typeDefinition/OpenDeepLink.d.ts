import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface OpenDeepLinkChain extends
	BaseChain<OpenDeepLinkChain, OpenDeepLinkEvalResult, OpenDeepLinkAbandonedChain>
{}

interface OpenDeepLinkAbandonedChain extends AbstractChain {}

type OpenDeepLinkEvalResult = void | boolean;
