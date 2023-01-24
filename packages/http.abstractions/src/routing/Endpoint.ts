import { EndpointMetadataCollection } from '@yohira/http.abstractions';

import { RequestDelegate } from '../RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Routing/Endpoint.cs,ae012ccd7b848f8e,references
export class Endpoint {
	constructor(
		readonly requestDelegate: RequestDelegate | undefined,
		readonly metadata: EndpointMetadataCollection | undefined,
		readonly displayName: string | undefined,
	) {}

	toString(): string | undefined {
		return this.displayName;
	}
}
