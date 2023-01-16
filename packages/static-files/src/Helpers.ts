import { IFileProvider } from '@yohira/extensions.file-providers';
import { IWebHostEnv } from '@yohira/hosting.abstractions';
import {
	IHttpContext,
	PathString,
	isGet,
	isHead,
} from '@yohira/http.abstractions';
import { Err, Ok, Result } from '@yohira/third-party.ts-results';

export function resolveFileProvider(hostingEnv: IWebHostEnv): IFileProvider {
	return hostingEnv.webRootFileProvider;
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,d4e3c36ab54b6c29,references
export function isGetOrHeadMethod(method: string): boolean {
	return isGet(method) || isHead(method);
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,2ac3b27b08014ad1,references
export function pathEndsInSlash(path: PathString): boolean {
	return !!path.value && path.value.endsWith('/');
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,f9089ca6c4ec31d8,references
export function tryMatchPath(
	context: IHttpContext,
	matchUrl: PathString,
	forDirectory: boolean,
): Result<PathString, PathString> {
	const { path } = context.request;

	if (forDirectory && !pathEndsInSlash(path)) {
		// TODO: path += new PathString('/');
	}

	const { ret, remaining: subpath } = path.startsWithSegments(matchUrl);
	if (ret) {
		return new Ok(subpath);
	}
	return new Err(subpath);
}
