export type Override<A extends object, B extends object> = Omit<A, keyof B> & B;

export type NonEmptyArray<T> = [T, ...T[]];

export type ExpressionString = `={{${string}}}`;

export type EnsureTypeOptions = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'json';

export type CloseFunction = () => Promise<void>;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K>;