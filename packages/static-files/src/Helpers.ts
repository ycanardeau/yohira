import { IFileProvider } from '@yohira/file-providers';
import { IWebHostEnv } from '@yohira/hosting';
import { IHttpContext, PathString, isGet, isHead } from '@yohira/http';
import { Err, Ok, Result } from 'ts-results';

export const resolveFileProvider = (hostingEnv: IWebHostEnv): IFileProvider => {
	return hostingEnv.webRootFileProvider;
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,d4e3c36ab54b6c29,references
export const isGetOrHeadMethod = (method: string): boolean => {
	return isGet(method) || isHead(method);
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,2ac3b27b08014ad1,references
export const pathEndsInSlash = (path: PathString): boolean => {
	return !!path.value && path.value.endsWith('/');
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,f9089ca6c4ec31d8,references
export const tryMatchPath = (
	context: IHttpContext,
	matchUrl: PathString,
	forDirectory: boolean,
): Result<PathString, PathString> => {
	const { path } = context.request;

	if (forDirectory && !pathEndsInSlash(path)) {
		// TODO: path += new PathString('/');
	}

	const { ret, remaining: subpath } = path.startsWithSegments(matchUrl);
	if (ret) {
		return Ok(subpath);
	}
	return Err(subpath);
};
