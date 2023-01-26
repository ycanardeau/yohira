import { CaseInsensitiveMap, tryGetValue } from '@yohira/base';
import { IHttpContext } from '@yohira/http.abstractions';
import { Result } from '@yohira/third-party.ts-results';

import { PolicyJumpTable } from './PolicyJumpTable';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/HttpMethodDictionaryPolicyJumpTable.cs,c5a4ecb49642a846,references
export class HttpMethodDictionaryPolicyJumpTable extends PolicyJumpTable {
	constructor(
		readonly exitDestination: number,
		readonly destinations: CaseInsensitiveMap<number> | undefined,
		readonly corsPreflightExitDestination: number,
		readonly corsPreflightDestinations:
			| CaseInsensitiveMap<number>
			| undefined,
	) {
		super();
	}

	getDestination(httpContext: IHttpContext): number {
		let tryGetValueResult: Result<number, undefined>;

		const httpMethod = httpContext.request.method;
		// TODO

		return this.destinations !== undefined &&
			(tryGetValueResult = tryGetValue(this.destinations, httpMethod)) &&
			tryGetValueResult.ok
			? tryGetValueResult.val
			: this.exitDestination;
	}
}
