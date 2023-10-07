import { IServiceProvider } from '@yohira/base';
import {
	IServiceScopeFactory,
	getRequiredService,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IFeatureCollection } from '@yohira/extensions.features';
import { HttpContext } from '@yohira/http';
import {
	IHttpContext,
	IHttpContextAccessor,
	IHttpContextFactory,
} from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Http/DefaultHttpContextFactory.cs,a66c2cafba21597c,references
export class HttpContextFactory implements IHttpContextFactory {
	readonly httpContextAccessor: IHttpContextAccessor | undefined;
	private readonly serviceScopeFactory: IServiceScopeFactory;

	constructor(
		@inject(IServiceProvider)
		serviceProvider: IServiceProvider,
	) {
		// May be undefined
		this.httpContextAccessor =
			serviceProvider.getService<IHttpContextAccessor>(
				IHttpContextAccessor,
			);
		this.serviceScopeFactory = getRequiredService(
			serviceProvider,
			IServiceScopeFactory,
		);
	}

	initialize(
		httpContext: HttpContext,
		featureCollection: IFeatureCollection,
	): void {
		httpContext.initialize(featureCollection);

		// TODO

		httpContext.serviceScopeFactory = this.serviceScopeFactory;
	}

	create(featureCollection: IFeatureCollection): IHttpContext {
		const httpContext = new HttpContext(featureCollection);
		this.initialize(httpContext, featureCollection);
		return httpContext;
	}

	dispose(httpContext: IHttpContext): void {
		/* TODO: if (this.httpContextAccessor !== undefined) {
			this.httpContextAccessor.httpContext = undefined;
		} */

		if (httpContext instanceof HttpContext) {
			// TODO: httpContext.uninitialize();
		}
	}
}
