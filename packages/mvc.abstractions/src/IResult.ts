import { IHttpContext } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResults/IResult.cs,a98b52b37fb3344b,references
/**
 * Defines a contract that represents the result of an HTTP endpoint.
 */
export interface IResult {
	/**
	 * Write an HTTP response reflecting the result.
	 * @param httpContext The {@link IHttpContext} for the current request.
	 * @returns A task that represents the asynchronous execute operation.
	 */
	execute(httpContext: IHttpContext): Promise<void>;
}
