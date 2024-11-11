import {
	AbstractChain,
	Timeout,
	InRegionModifier,
	VisibleModifier,
	AccuracyModifier,
	Negatable,
	Assertable,
	BaseEmptyChain,
} from './modifiers';
import {
	AccuracyModifierNames,
	AssertableMethodsNames,
	InRegionMethodsNames,
	NegatableMethodsNames,
	TimeoutMethodsNames,
	VisibleMethodsNames,
	Chainable,
	ChainWithoutMethods,
} from './utils';

interface ImageBase extends
	// not(), doesNot(), isNot()
	Negatable<ChainWithoutMethods<ImageBase, NegatableMethodsNames>>,
	// timeout(...)
	Timeout<ChainWithoutMethods<ImageBase, TimeoutMethodsNames>>,
	// visible()
	VisibleModifier<ChainWithoutMethods<ImageBase, VisibleMethodsNames>>,
	// inRegion(...)
	InRegionModifier<ChainWithoutMethods<ImageBase, InRegionMethodsNames>>,
	// accuracy(...)
	AccuracyModifier<ChainWithoutMethods<ImageBase, AccuracyModifierNames>>,
	// toAssert(...)
	Assertable<ChainWithoutMethods<ImageBase, AssertableMethodsNames>>,
	// toString(), then(), abandon(), clone()
	ImageBaseEvalChain<ImageBase>
{}

type ImageChain = Chainable<ImageBase>;

interface ImageBaseEvalChain<TSelf> extends
	BaseEmptyChain<TSelf, ImageEvalResult, ImageAbandonedChain>
{}

interface ImageAbandonedChain extends AbstractChain {}

type ImageEvalResult = boolean;
