
export type Class<T = object, A extends unknown[] = unknown[]> = new (...args: A) => T;