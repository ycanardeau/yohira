// https://www.stevejgordon.co.uk/how-is-the-asp-net-core-middleware-pipeline-built
import { IncomingMessage, ServerResponse, createServer } from 'node:http';
import { Server } from 'node:net';

interface ILogger {
	debug(message?: string, ...optionalParams: any[]): void;
	warn(message?: string, ...optionalParams: any[]): void;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HttpContext.cs,9bde6e3833d169c1,references
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IHttpContext {}

export class HttpContext implements IHttpContext {
	constructor(
		readonly nativeRequest: IncomingMessage,
		readonly nativeResponse: ServerResponse<IncomingMessage>,
	) {}
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/RequestDelegate.cs,51d975d94569085b,references
export type RequestDelegate = (context: IHttpContext) => Promise<void>;

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,8bf924cdca3bdd9e,references
interface IAppBuilder {
	// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,55520ccfac9ccf91,references
	use(middleware: (next: RequestDelegate) => RequestDelegate): this;
}

// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,036bfc42ede25c42,references
class AppBuilder implements IAppBuilder {
	private readonly components: ((
		next: RequestDelegate,
	) => RequestDelegate)[] = [];

	// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,51e168cb3e82bac8,references
	use = (middleware: (next: RequestDelegate) => RequestDelegate): this => {
		this.components.push(middleware);
		return this;
	};

	// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,4bdd7f36d734b764,references
	build = (): RequestDelegate => {
		let app: RequestDelegate = () => {
			return Promise.resolve();
		};

		for (let c = this.components.length - 1; c >= 0; c--) {
			app = this.components[c](app);
		}

		return app;
	};
}

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
	useMiddleware = <
		T extends {
			invoke: (context: IHttpContext) => Promise<void>;
		},
	>(
		ctor: new (next: RequestDelegate, ...args: unknown[]) => T,
	): this => {
		return this.use(async (context, next) => {
			const middleware = new ctor(next);
			await middleware.invoke(context);
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
