import { isGet, isHead } from '@/http/HttpMethods';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/Helpers.cs,d4e3c36ab54b6c29,references
export const isGetOrHeadMethod = (method: string): boolean => {
	return isGet(method) || isHead(method);
};
