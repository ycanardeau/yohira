import { IFeatureCollection } from '@yohira/extensions.features';
import { HttpContext } from '@yohira/http';
import { IHttpContext, IHttpContextFactory } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Http/DefaultHttpContextFactory.cs,a66c2cafba21597c,references
export class HttpContextFactory implements IHttpContextFactory {
	create(featureCollection: IFeatureCollection): IHttpContext {
		const httpContext = new HttpContext(featureCollection);
		// TODO
		return httpContext;
	}

	dispose(httpContext: IHttpContext): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
