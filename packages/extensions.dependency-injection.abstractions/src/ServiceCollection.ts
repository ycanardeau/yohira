import { List } from '@yohira/base/List';
import { IServiceCollection } from '@yohira/extensions.dependency-injection.abstractions/IServiceCollection';
import { ServiceDescriptor } from '@yohira/extensions.dependency-injection.abstractions/ServiceDescriptor';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/ServiceCollection.cs,beaaadffb389924e,references
export class ServiceCollection implements IServiceCollection {
	private readonly descriptors = new List<ServiceDescriptor>();
	private _isReadonly = false;

	get count(): number {
		return this.descriptors.count;
	}

	get isReadonly(): boolean {
		return this._isReadonly;
	}

	private checkReadonly = (): void => {
		if (this._isReadonly) {
			throw new Error(
				'The service collection cannot be modified because it is read-only.' /* LOC */,
			);
		}
	};

	makeReadonly = (): void => {
		this._isReadonly = true;
	};

	get = (index: number): ServiceDescriptor => {
		return this.descriptors.get(index);
	};

	set = (index: number, item: ServiceDescriptor): void => {
		this.checkReadonly();
		this.descriptors.set(index, item);
	};

	clear = (): void => {
		this.checkReadonly();
		this.descriptors.clear();
	};

	contains = (item: ServiceDescriptor): boolean => {
		return this.descriptors.contains(item);
	};

	// TODO: copyTo

	remove = (item: ServiceDescriptor): boolean => {
		this.checkReadonly();
		return this.descriptors.remove(item);
	};

	[Symbol.iterator](): Iterator<ServiceDescriptor> {
		return this.descriptors[Symbol.iterator]();
	}

	add = (item: ServiceDescriptor): void => {
		this.checkReadonly();
		this.descriptors.add(item);
	};

	indexOf = (item: ServiceDescriptor): number => {
		return this.descriptors.indexOf(item);
	};

	insert = (index: number, item: ServiceDescriptor): void => {
		this.checkReadonly();
		this.descriptors.insert(index, item);
	};

	removeAt = (index: number): void => {
		this.checkReadonly();
		this.descriptors.removeAt(index);
	};
}
