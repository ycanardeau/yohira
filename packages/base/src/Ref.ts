export interface Ref<T> {
	get(): T;
	set(value: T): void;
}
