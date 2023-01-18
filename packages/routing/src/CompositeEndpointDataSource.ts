import { ICollection, IDisposable, IReadonlyList, List } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/CompositeEndpointDataSource.cs,296d73b6a71a22b3,references
export class CompositeEndpointDataSource
	extends EndpointDataSource
	implements IDisposable
{
	private readonly dataSources: ICollection<EndpointDataSource>;

	private _endpoints?: List<Endpoint>;

	constructor(endpointDataSources: Iterable<EndpointDataSource>) {
		super();

		this.dataSources = new List<EndpointDataSource>();

		for (const dataSource of endpointDataSources) {
			this.dataSources.add(dataSource);
		}
	}

	private createEndpointsUnsynchronized(): void {
		const endpoints = new List<Endpoint>();

		for (const dataSource of this.dataSources) {
			endpoints.addRange(dataSource.endpoints);
		}

		this._endpoints = endpoints;
	}

	private ensureEndpointsInitialized(): void {
		if (this._endpoints !== undefined) {
			return;
		}

		// REVIEW: lock
		if (this._endpoints !== undefined) {
			return;
		}

		// TODO: this.ensureChangeTokenInitialized();

		this.createEndpointsUnsynchronized();
	}

	get endpoints(): IReadonlyList<Endpoint> {
		this.ensureEndpointsInitialized();
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._endpoints!;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
