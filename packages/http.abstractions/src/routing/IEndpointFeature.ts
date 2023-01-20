import { Endpoint } from './Endpoint';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/IEndpointFeature.cs,e167771e0f378812,references
export interface IEndpointFeature {
	endpoint?: Endpoint;
}
