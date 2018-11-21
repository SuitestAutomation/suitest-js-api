// Use Omit to exclude one or more fields (use 'field1' | 'field2' | 'field3' etc to exclude multiple)
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
