export type Type = string;

export type Ctor<T> = new (...args: any[]) => T;
