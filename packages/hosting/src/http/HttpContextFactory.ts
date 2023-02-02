import { IServiceProvider } from '@yohira/base';
import {
	IServiceScopeFactory,
	getRequiredService,
	inject,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IFeatureCollection } from '@yohira/extensions.features';
import { HttpContext } from '@yohira/http';
import { IHttpContext, IHttpContextFactory } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Http/DefaultHttpContextFactory.cs,a66c2cafba21597c,references
export class HttpContextFactory implements IHttpContextFactory {
	private readonly serviceScopeFactory: IServiceScopeFactory;

	constructor(
		@inject(Symbol.for('IServiceProvider'))
		serviceProvider: IServiceProvider,
	) {
		this.serviceScopeFactory = getRequiredService(
			serviceProvider,
			Symbol.for('IServiceScopeFactory'),
		);
	}

	initialize(
		httpContext: HttpContext,
		featureCollection: IFeatureCollection,
	): void {
		// TODO

		httpContext.serviceScopeFactory = this.serviceScopeFactory;
	}

	create(featureCollection: IFeatureCollection): IHttpContext {
		const httpContext = new HttpContext(featureCollection);
		this.initialize(httpContext, featureCollection);
		return httpContext;
	}

	dispose(httpContext: IHttpContext): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
