import { ICollection, List } from '@yohira/base';

import { EndpointDataSource } from './EndpointDataSource';
import { IEndpointRouteBuilder } from './IEndpointRouteBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/DefaultEndpointRouteBuilder.cs,c10e7b84cd327fb0,references
export class DefaultEndpointRouteBuilder implements IEndpointRouteBuilder {
	readonly dataSources: ICollection<EndpointDataSource>;

	constructor() {
		this.dataSources = new List<EndpointDataSource>();
	}
}
