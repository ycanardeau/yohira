import { IAppBuilder } from '@/http.abstractions/IAppBuilder';
import { IMiddleware } from '@/http.abstractions/IMiddleware';
import { use } from '@/http.abstractions/extensions/UseExtensions';
import { container } from '@/http.abstractions/inversify.config';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseMiddlewareExtensions.cs,e940dbf3ad65ffe4,references
export const useMiddleware = <T extends IMiddleware>(
	app: IAppBuilder,
	ctor: new (...args: never[]) => T,
): IAppBuilder => {
	return use(app, async (context, next) => {
		const middleware = container.get<T>(ctor);
		await middleware.invoke(context, next);
	});
};
