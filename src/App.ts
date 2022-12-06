// https://www.stevejgordon.co.uk/how-is-the-asp-net-core-middleware-pipeline-built
import { AppBuilder } from '@/http/AppBuilder';
import { HttpContext } from '@/http/HttpContext';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';
import { container } from '@/inversify.config';
import { ILogger } from '@/logging/ILogger';
import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import { Server } from 'node:net';
// TODO: Move.
import 'reflect-metadata';

export class App {
	private readonly app = new AppBuilder();

	constructor(private readonly logger: ILogger) {}

	// https://github.com/koajs/koa/blob/d7894c88a511b1dd604d5402a4ab0d9903747c5b/lib/application.js#L127
	use = (
		middleware: (
			context: IHttpContext,
			next: RequestDelegate,
		) => Promise<void>,
	): this => {
		this.logger.debug(`use ${middleware.name}`);
		// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseExtensions.cs,e5d66acebb0a871f,references
		this.app.use((next) => (context) => middleware(context, next));
		return this;
	};

	// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/UseMiddlewareExtensions.cs,e940dbf3ad65ffe4,references
	useMiddleware = <T extends IMiddleware>(
		ctor: new (...args: never[]) => T,
	): this => {
		return this.use(async (context, next) => {
			const middleware = container.get<T>(ctor);
			await middleware.invoke(context, next);
		});
	};

	// https://github.com/koajs/koa/blob/d7894c88a511b1dd604d5402a4ab0d9903747c5b/lib/application.js#L142
	private callback = (
		request: IncomingMessage,
		response: ServerResponse<IncomingMessage>,
	): void => {
		const requestDelegate = this.app.build();
		const context = new HttpContext(request, response);
		requestDelegate(context);
	};

	// https://github.com/koajs/koa/blob/d7894c88a511b1dd604d5402a4ab0d9903747c5b/lib/application.js#L84
	listen = (...args: Parameters<Server['listen']>): void => {
		this.logger.debug('listen');
		// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
		const server = createServer(this.callback);
		server.listen(...args);
	};
}
