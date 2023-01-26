// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpMethods.cs,c3838ebf74f60e5a,references
export enum HttpMethods {
	Connect = 'CONNECT',
	Delete = 'DELETE',
	Get = 'GET',
	Head = 'HEAD',
	Options = 'OPTIONS',
	Patch = 'PATCH',
	Post = 'POST',
	Put = 'PUT',
	Trace = 'TRACE',
}

export function HttpMethodsEquals(left: string, right: string): boolean {
	return left.toLowerCase() === right.toLowerCase();
}

export function isConnect(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Connect, method);
}

export function isDelete(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Delete, method);
}

export function isGet(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Get, method);
}

export function isHead(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Head, method);
}

export function isOptions(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Options, method);
}

export function isPatch(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Patch, method);
}

export function isPost(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Post, method);
}

export function isPut(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Put, method);
}

export function isTrace(method: string): boolean {
	return HttpMethodsEquals(HttpMethods.Trace, method);
}

export function getCanonicalizedValue(method: string): HttpMethods {
	if (isGet(method)) {
		return HttpMethods.Get;
	} else if (isPost(method)) {
		return HttpMethods.Post;
	} else if (isPut(method)) {
		return HttpMethods.Put;
	} else if (isDelete(method)) {
		return HttpMethods.Delete;
	} else if (isOptions(method)) {
		return HttpMethods.Options;
	} else if (isHead(method)) {
		return HttpMethods.Head;
	} else if (isPatch(method)) {
		return HttpMethods.Patch;
	} else if (isTrace(method)) {
		return HttpMethods.Trace;
	} else if (isConnect(method)) {
		return HttpMethods.Connect;
	} else {
		return method as HttpMethods;
	}
}
