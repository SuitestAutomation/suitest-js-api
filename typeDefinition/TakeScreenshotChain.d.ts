import {
	Abandable,
	AbstractChain,
	Thenable
} from './modifiers';

export interface TakeScreenshotChain<TResult> extends
	AbstractChain,
	Abandable<TakeScreenshotAbandonedChain>,
	Thenable<TResult>
{}

interface TakeScreenshotAbandonedChain extends AbstractChain {}
