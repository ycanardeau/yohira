import { IList } from '@yohira/base/IList';

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/Collections/Generic/List.cs,9e5352b2b304ceba
export class List<T> implements IList<T> {
	private readonly items: T[] = [];

	get count(): number {
		return this.items.length;
	}

	get isReadonly(): boolean {
		return false;
	}

	get = (index: number): T => {
		return this.items[index];
	};

	set = (index: number, item: T): void => {
		this.items[index] = item;
	};

	add = (item: T): void => {
		this.items.push(item);
	};

	clear = (): void => {
		this.items.splice(0, this.count);
	};

	contains = (item: T): boolean => {
		return this.items.includes(item);
	};

	// TODO: copyTo

	[Symbol.iterator](): Iterator<T> {
		return this.items[Symbol.iterator]();
	}

	indexOf = (item: T): number => {
		return this.items.indexOf(item);
	};

	insert = (index: number, item: T): void => {
		this.items.splice(index, 0, item);
	};

	removeAt = (index: number): void => {
		this.items.splice(index, 1);
	};

	remove = (item: T): boolean => {
		const index = this.indexOf(item);
		if (index >= 0) {
			this.removeAt(index);
			return true;
		}

		return false;
	};
}
