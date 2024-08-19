import {
	AbstractChain,
	Timeout,
	InRegionModifier,
	VisibleModifier,
	Negatable, BaseEmptyChain, Assertable,
} from './modifiers';

// +negation +timeout +visible +inRegion
export interface ImageChain extends
	Negatable<ImageWithoutNegationChain>,
	Timeout<ImageWithoutTimeoutChain>,
	VisibleModifier<ImageWithoutVisibleChain>,
	InRegionModifier<ImageWithoutRegionChain>,
	ImageBaseEvalChain<ImageChain>
{}

// -negation +timeout +visible +inRegion
export interface ImageWithoutNegationChain extends
	Timeout<ImageVisibleInRegionChain>,
	VisibleModifier<ImageTimeoutInRegionChain>,
	InRegionModifier<ImageVisibleTimeoutChain>,
	ImageBaseEvalChain<ImageWithoutNegationChain>
{}

// +negation -timeout +visible +inRegion
export interface ImageWithoutTimeoutChain extends
	Negatable<ImageWithoutNegationChain>,
	VisibleModifier<ImageTimeoutInRegionChain>,
	InRegionModifier<ImageVisibleTimeoutChain>,
	ImageBaseEvalChain<ImageWithoutTimeoutChain>
{}

// +negation +timeout -visible +inRegion
export interface ImageWithoutVisibleChain extends
	Negatable<ImageWithoutNegationChain>,
	Timeout<ImageWithoutTimeoutChain>,
	InRegionModifier<ImageWithoutRegionChain>,
	ImageBaseEvalChain<ImageWithoutVisibleChain>
{}

// +negation +timeout +visible -inRegion
export interface ImageWithoutRegionChain extends
	Negatable<ImageWithoutNegationChain>,
	Timeout<ImageWithoutTimeoutChain>,
	VisibleModifier<ImageWithoutVisibleChain>,
	ImageBaseEvalChain<ImageWithoutRegionChain>
{}

// +visible +inRegion
interface ImageVisibleInRegionChain extends
	VisibleModifier<ImageInRegionChain>,
	InRegionModifier<ImageVisibleChain>,
	ImageBaseEvalChain<ImageVisibleInRegionChain>
{}

// + timeout +region
interface ImageTimeoutInRegionChain extends
	Timeout<ImageInRegionChain>,
	InRegionModifier<ImageTimeoutChain>,
	ImageBaseEvalChain<ImageTimeoutInRegionChain>
{}

interface ImageVisibleTimeoutChain extends
	Timeout<ImageVisibleChain>,
	VisibleModifier<ImageTimeoutChain>,
	ImageBaseEvalChain<ImageVisibleTimeoutChain>
{}

// +region
interface ImageInRegionChain extends
	InRegionModifier<ImageEmptyChain>,
	ImageBaseEvalChain<ImageInRegionChain>
{}

// +visible
interface ImageVisibleChain extends
	VisibleModifier<ImageEmptyChain>,
	ImageBaseEvalChain<ImageVisibleChain>
{}

// +timeout
interface ImageTimeoutChain extends
	Timeout<ImageEmptyChain>,
	ImageBaseEvalChain<ImageTimeoutChain>
{}

interface ImageEmptyChain extends
	ImageBaseEvalChain<ImageEmptyChain>
{}

interface ImageBaseEvalChain<TSelf> extends
	BaseEmptyChain<TSelf, ImageEvalResult, ImageAbandonedChain>,
	Assertable<TSelf>
{}
interface ImageAbandonedChain extends AbstractChain {}

type ImageEvalResult = boolean;
