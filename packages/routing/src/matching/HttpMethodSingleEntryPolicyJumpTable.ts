import { HttpMethodsEquals, IHttpContext } from '@yohira/http.abstractions';

import { PolicyJumpTable } from './PolicyJumpTable';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodSingleEntryPolicyJumpTable.cs,443dee7d7ae6f2bf,references
export class HttpMethodSingleEntryPolicyJumpTable extends PolicyJumpTable {
	constructor(
		readonly exitDestination: number,
		readonly method: string,
		readonly destination: number,
		readonly supportsCorsPreflight: boolean,
		readonly corsPreflightExitDestination: number,
		readonly corsPreflightDestination: number,
	) {
		super();
	}

	getDestination(httpContext: IHttpContext): number {
		const httpMethod = httpContext.request.method;
		// TODO

		return HttpMethodsEquals(httpMethod, this.method)
			? this.destination
			: this.exitDestination;
	}
}
