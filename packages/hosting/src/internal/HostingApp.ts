import { IHttpApp } from '@yohira/hosting.server.abstractions/IHttpApp';
import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

class HostingAppContext {
	httpContext?: IHttpContext;
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingApplication.cs,91ffdac1d653a48b,references
export class HostingApp implements IHttpApp<HostingAppContext> {
	constructor(
		private readonly app: RequestDelegate,
		private readonly httpContextFactory: IHttpContextFactory,
	) {}

	// TODO
	createContext = (): HostingAppContext => {
		const hostContext = new HostingAppContext();
		const httpContext = this.httpContextFactory.create();
		hostContext.httpContext = httpContext;

		// TODO: this.diagnostics.beginRequest(httpContext, hostContext);
		return hostContext;
	};

	processRequest = (context: HostingAppContext): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};

	disposeContext = (
		context: HostingAppContext,
		error: Error | undefined,
	): void => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
