// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IHttpRequestFeature.cs,6e78bf067a671192,references
export interface IHttpRequestFeature {
	method: string;
	path: string;
	queryString: string;
	rawBody: string;
}
