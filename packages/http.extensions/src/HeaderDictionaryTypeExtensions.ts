import { IHttpRequest } from '@yohira/http.abstractions';

import { RequestHeaders } from './RequestHeaders';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/HeaderDictionaryTypeExtensions.cs,eac2f17645134c37,references
export function getTypedHeaders(request: IHttpRequest): RequestHeaders {
	return new RequestHeaders(/* TODO */);
}
