import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/PolicyJumpTable.cs,9d054c5bc0c61b78,references
export abstract class PolicyJumpTable {
	abstract getDestination(httpContext: IHttpContext): number;

	debuggerToString(): string {
		return `${this.constructor.name}`;
	}
}
