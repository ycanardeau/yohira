// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpMethods.cs,c3838ebf74f60e5a,references
export enum HttpMethods {
	Get = 'GET',
	Head = 'HEAD',
}

function equals(left: string, right: string): boolean {
	return left.toLowerCase() === right.toLowerCase();
}

export function isGet(method: string): boolean {
	return equals(HttpMethods.Get, method);
}

export function isHead(method: string): boolean {
	return equals(HttpMethods.Head, method);
}
