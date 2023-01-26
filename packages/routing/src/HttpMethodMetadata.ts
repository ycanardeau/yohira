import { Type, typedef } from '@yohira/base';
import { HttpMethods, getCanonicalizedValue } from '@yohira/http.abstractions';

import { IHttpMethodMetadata } from './IHttpMethodMetadata';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/HttpMethodMetadata.cs,13c7687564af679f,references
@typedef(Type.from('HttpMethodMetadata'), {
	implements: [Type.from('IHttpMethodMetadata')],
})
export class HttpMethodMetadata implements IHttpMethodMetadata {
	readonly httpMethods: HttpMethods[];

	constructor(
		httpMethods: readonly HttpMethods[],
		public acceptCorsPreflight = false,
	) {
		this.httpMethods = httpMethods.map(getCanonicalizedValue);
	}

	debuggerToString(): string {
		return `HttpMethods: ${this.httpMethods.join(',')} - Cors: ${
			this.acceptCorsPreflight
		}`;
	}
}