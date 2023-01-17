import { ICollection } from './ICollection';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/IList.cs,b19f71a84062554b,references
export interface IList<T> extends ICollection<T> {
	get(index: number): T;
	set(index: number, item: T): void;
	insert(index: number, item: T): void;
	removeAt(index: number): void;
}
