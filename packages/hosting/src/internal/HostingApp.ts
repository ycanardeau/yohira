import { IFeatureCollection } from '@yohira/extensions.features';
import { IHttpApp } from '@yohira/hosting.server.abstractions';
import {
	IHttpContext,
	IHttpContextFactory,
	RequestDelegate,
} from '@yohira/http.abstractions';

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
	createContext(contextFeatures: IFeatureCollection): HostingAppContext {
		const hostContext = new HostingAppContext();
		const httpContext = this.httpContextFactory.create(contextFeatures);
		hostContext.httpContext = httpContext;

		// TODO: this.diagnostics.beginRequest(httpContext, hostContext);
		return hostContext;
	}

	processRequest(context: HostingAppContext): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.app(context.httpContext!);
	}

	disposeContext(context: HostingAppContext, error: Error | undefined): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
