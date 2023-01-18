import { ICollection } from '@yohira/base';

import { EndpointDataSource } from './EndpointDataSource';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/IEndpointRouteBuilder.cs,c0fdb241b5c2088e,references
export interface IEndpointRouteBuilder {
	readonly dataSources: ICollection<EndpointDataSource>;
}
