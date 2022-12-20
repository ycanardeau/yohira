import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IMiddleware } from '@yohira/http.abstractions/IMiddleware';
import { use } from '@yohira/http.abstractions/extensions/UseExtensions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseMiddlewareExtensions.cs,e940dbf3ad65ffe4,references
export const useMiddleware = <T extends IMiddleware>(
	app: IAppBuilder,
	ctor: new (...args: never[]) => T,
): IAppBuilder => {
	return use(app, async (context, next) => {
		const middleware = context.requestServices.get<T>(ctor);
		await middleware.invoke(context, next);
	});
};