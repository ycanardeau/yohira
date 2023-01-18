import { IHttpContext } from '@yohira/http.abstractions';

import { Matcher } from './Matcher';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaMatcher.cs,0b08e610bec2cfbc,references
export class DfaMatcher extends Matcher {
	match(context: IHttpContext): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
