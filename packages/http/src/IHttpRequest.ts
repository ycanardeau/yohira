import { IHttpContext } from './IHttpContext';
import { PathString } from './PathString';
import { RequestHeaders } from './RequestHeaders';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpRequest.cs,ea81be9b74317002,references
export interface IHttpRequest {
	readonly httpContext: IHttpContext;
	method: string;
	path: PathString;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/HeaderDictionaryTypeExtensions.cs,eac2f17645134c37,references
export const getTypedHeaders = (request: IHttpRequest): RequestHeaders => {
	return new RequestHeaders(/* TODO */);
};
