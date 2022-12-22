import { ICollection } from '@yohira/base/ICollection';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/IList.cs,b19f71a84062554b,references
export interface IList<T> extends ICollection<T> {
	insert(index: number, item: T): void;
	removeAt(index: number): void;
}
