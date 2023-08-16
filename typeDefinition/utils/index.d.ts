export type ValueOf<T> = T[keyof T];

/**
 * @description utility type for checking that TObject is satisfies TSubject (aka satisfies operator)
 */
export type Satisfies<TObject extends TSubject, TSubject> = TObject;
