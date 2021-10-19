import {
	AbstractChain,
	BaseChain
} from './modifiers';

export interface ChangeDeviceStateChain extends
	BaseChain<ChangeDeviceStateChain, LockSleepEvalResult, LockAbandonedChain>
{}

interface LockAbandonedChain extends AbstractChain {}

type LockSleepEvalResult = void | boolean;
