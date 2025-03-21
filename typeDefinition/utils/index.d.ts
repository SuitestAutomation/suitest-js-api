import {AccuracyModifier, Assertable, InRegionModifier, Negatable, Timeout, VisibleModifier, OnScreenModifier} from '../modifiers';

export type ValueOf<T> = T[keyof T];

/**
 * @description utility type for checking that TObject is satisfies TSubject (aka satisfies operator)
 */
export type Satisfies<TObject extends TSubject, TSubject> = TObject;

/**
 * @description utility type for converting given interface for describe suitest chains
 * @example
 *
 * interface ExampleInterface {
 *   method1: () => ChainWithoutMethods<ExampleInterface, 'method1'>;
 *   method2: () => ChainWithoutMethods<ExampleInterface, 'method2'>;
 *   method3: () => string;
 * }
 *
 * type ChainableExample = Chainable<ExampleInterface>;
 *
 * declare const example: ChainableExample;
 *
 * example
 *   .method1()
 *   .method3(); // -> string will be returned
 *
 * example
 *   .method1()
 *   .method1(); // -> will be displayed error since method1 already called and no longer presents in chain
 *
 * example
 *   .method1()
 *   .method2()
 *   .method2(); // -> will be displayed error since method2 already called and no longer presents in chain;
 */
export type Chainable<T> = {
	[K in keyof T]: T[K] extends (...args: any[]) => ChainWithoutMethods<T, infer ExcludeMethods>
		// if field is function than return new chain without specified methods names
		? (...args: Parameters<T[K]>) => Chainable<WithoutMethods<T, ExcludeMethods>>
		// will be returned as it is, if field not function or function which not return MethodToOmit helper type
		: T[K];
};

export type WithoutMethods<T, K extends keyof T> = Omit<T, K>;

export type ChainWithoutMethods<T, ExcludeMethods extends keyof T> = {
	__excludeMethods: ExcludeMethods,
}

export type NegatableMethodsNames = keyof Negatable<any>;
export type TimeoutMethodsNames = keyof Timeout<any>;
export type VisibleMethodsNames = keyof VisibleModifier<any>;
export type InRegionMethodsNames = keyof InRegionModifier<any>;
export type AssertableMethodsNames = keyof Assertable<any>;
export type AccuracyModifierNames = keyof AccuracyModifier<any>;
export type OnScreenModifierNames = keyof OnScreenModifier<any>;
