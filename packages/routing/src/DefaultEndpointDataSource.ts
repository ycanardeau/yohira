import { Endpoint } from '@yohira/http.abstractions';

import { EndpointDataSource } from './EndpointDataSource';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/DefaultEndpointDataSource.cs,a21c6282a2598c91,references
export class DefaultEndpointDataSource extends EndpointDataSource {
	readonly endpoints: readonly Endpoint[];

	constructor(endpoints: Iterable<Endpoint>) {
		super();

		this.endpoints = [];
		(this.endpoints as Endpoint[]).push(...endpoints);
	}
}
