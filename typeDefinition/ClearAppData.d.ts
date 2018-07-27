import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface ClearAppDataChain extends
	BaseChain<ClearAppDataChain, ClearAppDataEvalResult, ClearAppDataAbandonedChain>
{}


interface ClearAppDataAbandonedChain extends AbstractChain {}

type ClearAppDataEvalResult = void | boolean;
