import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/Matcher.cs,d57f3aa40e736b5f,references
export abstract class Matcher {
	abstract match(context: IHttpContext): Promise<void>;
}
