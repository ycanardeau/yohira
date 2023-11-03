import { IDisposable } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/DataSourceDependentCache.cs,576bd81b7918d64e,references
export class DataSourceDependentCache<T> implements IDisposable {
	private readonly initializeCore: (endpoints: readonly Endpoint[]) => T;
	private readonly initializer: () => T;

	private initialized = false;
	private _value: T | undefined;

	private disposed = false;

	private initialize = (): T => {
		// REVIEW: lock
		// TODO
		this._value = this.initializeCore(this.dataSource.endpoints);

		if (this.disposed) {
			return this._value;
		}

		// TODO
		return this._value;
	};

	constructor(
		private readonly dataSource: EndpointDataSource,
		initialize: (endpoints: readonly Endpoint[]) => T,
	) {
		this.initializeCore = initialize;

		this.initializer = this.initialize;
		// TODO
	}

	get value(): T | undefined {
		return this._value;
	}

	ensureInitialized(): T {
		// REVIEW: lock
		if (this.initialized) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this._value!;
		}
		this._value = this.initializer();
		this.initialized = true;
		return this._value;
	}

	[Symbol.dispose](): void {
		// REVIEW: lock
		if (!this.disposed) {
			// TODO

			this.disposed = true;
		}
	}
}
