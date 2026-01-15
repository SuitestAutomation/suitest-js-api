import {
	AbstractChain,
	BaseChain,
} from './modifiers';

export interface SwitchContextChain extends
	BaseChain<SwitchContextChain, SwitchContextEvalResult, SwitchContextAbandonedChain>
{}

interface SwitchContextAbandonedChain extends AbstractChain {}

type SwitchContextEvalResult = unknown;
