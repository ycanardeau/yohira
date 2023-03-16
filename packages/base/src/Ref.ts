export interface In<T> {
	get(): T;
}

export interface Out<T> {
	set(value: T): void;
}

export interface Ref<T> extends In<T>, Out<T> {}
