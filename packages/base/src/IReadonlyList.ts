import { IReadonlyCollection } from './IReadonlyCollection';

export interface IReadonlyList<T> extends IReadonlyCollection<T> {
	get(index: number): T;
}
