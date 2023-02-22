export interface IComparer<T> {
	compare(x: T | undefined, y: T | undefined): number;
}
