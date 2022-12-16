import { IHttpContext } from '@/http.abstractions/IHttpContext';
import { StatusCodes } from '@/http.abstractions/StatusCodes';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResponse.cs,7642421540ea6ef2,references
export interface IHttpResponse {
	/**
	 * Gets the {@link IHttpContext} for this response.
	 */
	readonly httpContext: IHttpContext;
	/**
	 * Gets or sets the HTTP response code.
	 */
	statusCode: StatusCodes;
	/**
	 * Gets or sets the value for the <c>Content-Type</c> response header.
	 */
	contentType: string | undefined;
}
