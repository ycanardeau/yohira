import { IHttpContext } from '@/http/IHttpContext';
import { StatusCodes } from '@/http/StatusCodes';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpResponse.cs,7642421540ea6ef2,references
export interface IHttpResponse {
	readonly httpContext: IHttpContext;
	statusCode: StatusCodes;
}
