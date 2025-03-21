import {
	AbstractChain,
	Timeout,
	InRegionModifier,
	VisibleModifier,
	AccuracyModifier,
	Negatable,
	Assertable,
	BaseEmptyChain,
	OnScreenModifier,
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
	OnScreenModifierNames,
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
	// onScreen()
	OnScreenModifier<ChainWithoutMethods<ImageBase, OnScreenModifierNames>>,
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
