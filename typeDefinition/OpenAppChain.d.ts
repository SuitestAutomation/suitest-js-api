import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface OpenAppChain extends
	BaseChain<OpenAppChain, OpenAppEvalResult, OpenAppAbandonedChain>
{}

interface OpenAppAbandonedChain extends AbstractChain {}

type OpenAppEvalResult = void;
