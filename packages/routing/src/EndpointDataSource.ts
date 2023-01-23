import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/EndpointDataSource.cs,e430965f5ce4b2ff,references
export abstract class EndpointDataSource {
	abstract endpoints: readonly Endpoint[];
}
