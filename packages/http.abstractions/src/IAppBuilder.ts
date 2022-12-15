import { container } from '@yohira/http';

import { IHttpContext } from './IHttpContext';
import { IMiddleware } from './IMiddleware';
import { RequestDelegate } from './RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,8bf924cdca3bdd9e,references
export interface IAppBuilder {
	use(middleware: (next: RequestDelegate) => RequestDelegate): this;
	build(): RequestDelegate;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseExtensions.cs,e5d66acebb0a871f,references
export const use = (
	app: IAppBuilder,
	middleware: (context: IHttpContext, next: RequestDelegate) => Promise<void>,
): IAppBuilder => {
	return app.use((next) => (context) => middleware(context, next));
};

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
