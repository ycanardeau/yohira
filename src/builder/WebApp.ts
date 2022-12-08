import { WebAppBuilder } from '@/builder/WebAppBuilder';
import { AppBuilder } from '@/http/AppBuilder';
import { HttpContext } from '@/http/HttpContext';
import { IAppBuilder } from '@/http/IAppBuilder';
import { RequestDelegate } from '@/http/RequestDelegate';
import {
	IncomingMessage,
	Server,
	ServerResponse,
	createServer,
} from 'node:http';
// TODO: Move.
import 'reflect-metadata';

// https://source.dot.net/#Microsoft.AspNetCore/WebApplication.cs,e41b5d12c49f9700,references
export class WebApp implements IAppBuilder {
	readonly appBuilder: IAppBuilder;

	constructor() {
		this.appBuilder = new AppBuilder(/* TODO */);
	}

	use = (middleware: (next: RequestDelegate) => RequestDelegate): this => {
		this.appBuilder.use(middleware);
		return this;
	};

	build = (): RequestDelegate => {
		return this.appBuilder.build();
	};

	// https://github.com/koajs/koa/blob/d7894c88a511b1dd604d5402a4ab0d9903747c5b/lib/application.js#L142
	private callback = (
		request: IncomingMessage,
		response: ServerResponse<IncomingMessage>,
	): void => {
		const requestDelegate = this.build();
		const context = new HttpContext(request, response);
		requestDelegate(context);
	};

	// https://github.com/koajs/koa/blob/d7894c88a511b1dd604d5402a4ab0d9903747c5b/lib/application.js#L84
	listen = (...args: Parameters<Server['listen']>): void => {
		// TODO: this.logger.debug('listen');
		// https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener
		const server = createServer(this.callback);
		server.listen(...args);
	};

	run = (): void => {
		this.listen(8000 /* TODO */);
	};
}

export const createWebAppBuilder = (): WebAppBuilder => {
	return new WebAppBuilder(); /* TODO */
};
