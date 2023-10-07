import { IFeatureCollection } from '@yohira/extensions.features';
import { HttpContextFactory } from '@yohira/hosting';
import {
	IHostContextContainer,
	IHttpApp,
} from '@yohira/hosting.server.abstractions';
import { HttpContext } from '@yohira/http';
import {
	IHttpContext,
	IHttpContextFactory,
	RequestDelegate,
} from '@yohira/http.abstractions';

export class HostingAppContext {
	httpContext: IHttpContext | undefined;

	reset(): void {
		// Not resetting HttpContext here as we pool it on the Context
		// TODO
	}
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingApplication.cs,91ffdac1d653a48b,references
export class HostingApp implements IHttpApp<HostingAppContext> {
	private readonly httpContextFactory: IHttpContextFactory | undefined;
	private readonly defaultHttpContextFactory: HttpContextFactory | undefined;

	constructor(
		private readonly app: RequestDelegate,
		httpContextFactory: IHttpContextFactory,
	) {
		// TODO
		if (httpContextFactory instanceof HttpContextFactory) {
			this.defaultHttpContextFactory = httpContextFactory;
		} else {
			this.httpContextFactory = httpContextFactory;
		}
	}

	private static isIHostContextContainer<HostingAppContext>(
		contextFeatures:
			| IFeatureCollection
			| (IFeatureCollection & IHostContextContainer<HostingAppContext>),
	): contextFeatures is IFeatureCollection &
		IHostContextContainer<HostingAppContext> {
		return 'hostContext' in contextFeatures;
	}

	// TODO
	createContext(contextFeatures: IFeatureCollection): HostingAppContext {
		let hostContext: HostingAppContext | undefined;
		if (
			HostingApp.isIHostContextContainer<HostingAppContext>(
				contextFeatures,
			)
		) {
			hostContext = contextFeatures.hostContext;
			if (hostContext === undefined) {
				hostContext = new HostingAppContext();
				contextFeatures.hostContext = hostContext;
			}
		} else {
			hostContext = new HostingAppContext();
		}

		let httpContext: IHttpContext;
		if (this.defaultHttpContextFactory !== undefined) {
			const defaultHttpContext = hostContext.httpContext as HttpContext;
			if (defaultHttpContext === undefined) {
				httpContext =
					this.defaultHttpContextFactory.create(contextFeatures);
				hostContext.httpContext = httpContext;
			} else {
				this.defaultHttpContextFactory.initialize(
					defaultHttpContext,
					contextFeatures,
				);
				httpContext = defaultHttpContext;
			}
		} else {
			httpContext =
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.httpContextFactory!.create(contextFeatures);
			hostContext.httpContext = httpContext;
		}

		// TODO: this.diagnostics.beginRequest(httpContext, hostContext);
		return hostContext;
	}

	processRequest(context: HostingAppContext): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.app(context.httpContext!);
	}

	disposeContext(context: HostingAppContext, error: Error | undefined): void {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const httpContext = context.httpContext!;
		// TODO

		if (this.defaultHttpContextFactory !== undefined) {
			this.defaultHttpContextFactory.dispose(httpContext);

			if (
				this.defaultHttpContextFactory.httpContextAccessor !== undefined
			) {
				// Clear the HttpContext if the accessor was used. It's likely that the lifetime extends
				// past the end of the http request and we want to avoid changing the reference from under
				// consumers.
				context.httpContext = undefined;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.httpContextFactory!.dispose(httpContext);
		}

		// TODO

		context.reset();
	}
}
