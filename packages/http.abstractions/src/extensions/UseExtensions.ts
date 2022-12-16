import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseExtensions.cs,e5d66acebb0a871f,references
export const use = (
	app: IAppBuilder,
	middleware: (context: IHttpContext, next: RequestDelegate) => Promise<void>,
): IAppBuilder => {
	return app.use((next) => (context) => middleware(context, next));
};
