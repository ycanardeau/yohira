import { IHttpRequest } from '@/http.abstractions/IHttpRequest';
import { RequestHeaders } from '@/http.extensions/RequestHeaders';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/HeaderDictionaryTypeExtensions.cs,eac2f17645134c37,references
export const getTypedHeaders = (request: IHttpRequest): RequestHeaders => {
	return new RequestHeaders(/* TODO */);
};