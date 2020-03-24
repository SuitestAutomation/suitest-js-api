import {
	Abandable,
	AbstractChain,
	Thenable
} from './modifiers';

export interface TakeScreenshotChain extends
	AbstractChain,
	Abandable<TakeScreenshotAbandonedChain>,
	Thenable<TakeScreenshotChainEvalResult>
{}

interface TakeScreenshotAbandonedChain extends AbstractChain {}

type TakeScreenshotChainEvalResult = Buffer;
