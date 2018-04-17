export interface Thenable <R> {
	then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
	then <U> (onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

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
}

export interface Clonable<T> {
	clone(): T;
}

export interface Abandable<T> {
	abandon(): T;
}

export interface Timeout<T> {
	timeout(milliseconds: number): T;
}

export interface Clickable<T> {
	click(): T;
}

export interface MoveToModifier<T> {
	moveTo(): T;
}

export interface SendTextModifier<T> {
	sendText(text: string): T
}

export interface Repeatable<T> {
	repeat(times: number): T;
}

export interface Intervalable<T> {
	interval(milliseconds: number): T;
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

export interface ExistsModifiers<T> {
	exist(): T;
	exists(): T;
}

export interface WasMadeModifier<T> {
	wasMade(): T;
}

export interface WillMadeModifier<T> {
	willBeMade(): T;
}

export interface RequestMatchesModifier<T> {
	requestMatches(request: object|object[]): T;
}

export interface ResponseMatchesModifier<T> {
	responseMatches(response: object|object[]): T;
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

export type PropertyValue = string | number | symbol;
export type PropertyObjectDefinition = {
	name: symbol | string,
	val?: PropertyValue,
	type?: symbol,
	deviation?: number
};

export type PropertyRepoObjectDefinition = {
	type?: symbol,
	deviation?: number
};

type PropertyDefinitionType = Array<symbol | string | PropertyObjectDefinition>;
type PropNameType = symbol | string;


export interface ElementMatchModifiers<T> {
	match(propertyName: PropNameType, propertyValue?: PropertyValue, comparator?: symbol, accuracy?: number): T;
	match(propertyDefinition: PropertyObjectDefinition): T;
	match(propertyDefinition: PropertyDefinitionType): T;

	matches(propertyName: PropNameType, propertyValue?: PropertyValue, comparator?: symbol, accuracy?: number): T;
	matches(propertyDefinition: PropertyObjectDefinition): T;
	matches(propertyDefinition: PropertyDefinitionType): T;

	matchRepo(propertyName: PropNameType, comparator?: symbol, accuracy?: number): T;
	matchRepo(propertyDefinition: PropertyRepoObjectDefinition): T;
	matchRepo(propertyDefinition: PropertyDefinitionType): T;

	matchesRepo(propertyName: PropNameType, comparator?: symbol, accuracy?: number): T;
	matchesRepo(propertyDefinition: PropertyRepoObjectDefinition): T;
	matchesRepo(propertyDefinition: PropertyDefinitionType): T;
}

export interface HasExitedModifiers<T> {
	hasExited(): T;
}
