// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IRequestCookieCollection.cs,a3d517392e2ed5e8,references
export interface IRequestCookieCollection extends Iterable<[string, string]> {
	readonly count: number;
	get(key: string): string | undefined;
}
