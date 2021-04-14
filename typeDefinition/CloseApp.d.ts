import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface CloseAppChain extends
	BaseChain<CloseAppChain, CloseAppEvalResult, CloseAppAbandonedChain>
{}


interface CloseAppAbandonedChain extends AbstractChain {}

type CloseAppEvalResult = void | boolean;
