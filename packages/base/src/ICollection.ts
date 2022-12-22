// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/ICollection.cs,a9bf1395d3addc77,references
export interface ICollection<T> extends Iterable<T> {
	readonly count: number;
	readonly isReadonly: boolean;
	add(item: T): void;
	clear(): void;
	contains(item: T): boolean;
	remove(item: T): boolean;
}
