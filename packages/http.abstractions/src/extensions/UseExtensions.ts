import { IAppBuilder } from '@/IAppBuilder';
import { IHttpContext } from '@/IHttpContext';
import { RequestDelegate } from '@/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseExtensions.cs,e5d66acebb0a871f,references
export function use(
	app: IAppBuilder,
	middleware: (context: IHttpContext, next: RequestDelegate) => Promise<void>,
): IAppBuilder {
	return app.use((next) => (context) => middleware(context, next));
}
