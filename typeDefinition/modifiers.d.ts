import {ValueOf} from './utils';
import {LaunchModeValues} from './constants/LaunchMode';
import {Lang} from './constants/Langs';
import {Accuracy} from './constants/Accuracy';

export interface Thenable <R> {
	then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
	then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

/**
 * @description should return string representation of chain. May throw SuitestError if chain is malformed
 * @throws {SuitestError} - May happen if chain is malformed
 */
export interface AbstractChain {
	toString(): String;
}

export interface BaseChain<TSelf, TThen, TAbandon> extends
	BaseEmptyChain<TSelf, TThen, TAbandon>,
	GettersModifiers<TSelf>,
	Assertable<TSelf>
{}

export interface BaseEmptyChain<TSelf, TThen, TAbandon> extends
	AbstractChain,
	Abandable<TAbandon>,
	Clonable<TSelf>,
	Thenable<TThen>
{}

export interface Assertable<T> {
	toAssert(): T;
}

export interface Negatable<T> {
	not(): T;
	doesNot(): T;
	isNot(): T;
}

export interface Clonable<T> {
	clone(): T;
}

export interface LaunchModeModifier<T> {
	launchMode(mode: LaunchModeValues): T;
}

export interface DeepLinkModifier<T> {
	deepLink(value: string): T;
}

export interface Abandable<T> {
	abandon(): T;
}

export interface Timeout<T> {
	timeout(milliseconds: number | string): T;
}

export interface Clickable<T> {
	click(): T;
}

export interface MoveToModifier<T> {
	moveTo(): T;
}

export interface TapModifier<T> {
	tap(type: 'single' | 'double' | 'long'): T;
	tap(type: 'long', duration: number | string): T;
}

type Direction = 'up' | 'down' | 'left' | 'right';

export interface ScrollModifier<T> {
	scroll(direction: Direction, distance?: number | string): T;
}

export interface SwipeModifier<T> {
	swipe(direction: Direction, distance: number | string, duration: number | string): T;
	flick(direction: Direction, distance: number | string, duration: number | string): T;
}

export interface VideoStateModifiers<T> {
	isPlaying(): T;
	isPaused(): T;
	isStopped(): T;
}

export interface SendTextModifier<T> {
	sendText(text: string): T
}

export interface SetTextModifier<T> {
	setText(text: string): T
}

export interface Repeatable<T> {
	repeat(times: number | string): T;
}

export interface Intervalable<T> {
	interval(milliseconds: number | string): T;
}

export interface Equalable<T> {
	equal(value: string): T;
	equals(value: string): T;
}

export interface Containable<T> {
	contain(value: string): T;
	contains(value: string): T;
}

export interface StringModifiers<T> extends Equalable<T>, Containable<T> {
	startWith(value: string): T;
	startsWith(value: string): T;
	endWith(value: string): T;
	endsWith(value: string): T;
}

export type JSExpression = ((value: any) => boolean) | string;
export interface MatchJSModifiers<T> {
	matchJS(value: JSExpression): T;
	matchesJS(value: JSExpression): T;
}

export type BrightScriptExpression = string;
export interface MatchBrightScriptModifiers<T> {
	matchBrightScript(value: BrightScriptExpression): T;
	matchesBrightScript(value: BrightScriptExpression): T;
}

export interface ExistsModifiers<T> {
	exist(): T;
	exists(): T;
}

export interface VisibleModifier<T> {
	visible(): T;
}

export interface WasMadeModifier<T> {
	wasMade(): T;
}

export interface WillMadeModifier<T> {
	willBeMade(): T;
}

type RequestPropName = symbol | string;
type RequestPropValue =  string | number;
type RequestPropComparator = string;
type RequestItem = {
	name: RequestPropName,
	val: RequestPropValue,
	type?: RequestPropComparator
}

export interface RequestMatchesModifier<T> {
	requestMatches(request: RequestItem | (RequestItem | object)[] | object): T;
	requestMatches(name: RequestPropName, value: RequestPropValue, type?: RequestPropComparator): T;
}

type ResponsePropName = symbol | string;
type ResponsePropValue = string | number;
type ResponsePropComparator = string;
type ResponseMatchItem = {
	name: ResponsePropName,
	val: ResponsePropValue,
	type?: ResponsePropComparator
}

export interface ResponseMatchesModifier<T> {
	responseMatches(response: ResponseMatchItem | (ResponseMatchItem | object)[] | object): T;
	responseMatches(name: ResponsePropName, value: ResponsePropValue, type?: ResponsePropComparator): T;
}

export interface UntilModifier<T> {
	until(chain: any): T;
}

export interface GettersModifiers<T> {
	with: T;
	it: T;
	should: T;
	times: T;
}

export declare namespace WindowModifiers {
	export interface Refresh<T> {
		refresh(): T;
	}

	export interface Navigate<T> {
		goForward(): T;
		goBack(): T;
	}

	export interface SetSize<T> {
		setSize(width: number, height: number): T;
	}

	export interface ModalInterruct<T> {
		dismissModal(): T;
		acceptModal(test?: string): T;
	}
}

export interface HadNoErrorModifier<T> {
	hadNoError(searchStrategy?: 'all' | 'currentUrl'): T;
}

export type PropertyValue = string | number | symbol | boolean;
export type PropertyObjectDefinition = {
	name: PropNameType,
	val?: PropertyValue,
	type?: string,
	deviation?: number
};

export type PropertyRepoObjectDefinition = {
	name: PropNameType,
	type?: string,
	deviation?: number
};

type MatchesPropertiesItems = Array<string | PropertyObjectDefinition | object>;
type MatchesRepoPropertiesItems = (string | PropertyRepoObjectDefinition)[]
type PropNameType = string;


export interface ElementMatchModifiers<T> {
	match(propertyName: PropNameType, propertyValue?: PropertyValue, comparator?: string, accuracy?: number | string): T;
	match(propertyDefinition: PropertyObjectDefinition | MatchesPropertiesItems | object ): T;

	matches(propertyName: PropNameType, propertyValue?: PropertyValue, comparator?: string, accuracy?: number | string): T;
	matches(propertyDefinition: PropertyObjectDefinition | MatchesPropertiesItems | object): T;

	matchRepo(propertyName: PropNameType, comparator?: string, accuracy?: number | string): T;
	matchRepo(propertyDefinition: PropertyRepoObjectDefinition | MatchesRepoPropertiesItems): T;

	matchesRepo(propertyName: PropNameType, comparator?: string, accuracy?: number | string): T;
	matchesRepo(propertyDefinition: PropertyRepoObjectDefinition | MatchesRepoPropertiesItems): T;
}

export interface WithProperties<TProp, TReturn> {
	withProperties: (props: TProp[]) => TReturn,
}

export interface HasExitedModifiers<T> {
	hasExited(): T;
}

export interface GetCssModifiers<T> {
	getCssProperties(properties: string[]): T;
}

export interface HandleModifier<TSingleHandle, TMultipleHandle> {
	handle(): TSingleHandle;
	handle(multiple: false): TSingleHandle;
	handle(multiple: true): TMultipleHandle;
	handle(opts: {}): TSingleHandle;
	handle(opts: {multiple: false}): TSingleHandle;
	handle(opts: {multiple: true}): TMultipleHandle;
}

export interface GetAttributesModifier<T> {
	getAttributes(attributes?: string[]): T;
}

export interface InRegionModifier<T> {
	inRegion(region: [number | null, number | null, number | null, number | null]): T;
}

export interface Language<T> {
	language(lang: ValueOf<Lang>): T;
}

export interface AccuracyModifier<T> {
	accuracy(accuracy: ValueOf<Accuracy>): T;
}

export interface OnScreenModifier<T> {
	onScreen(): T;
}
