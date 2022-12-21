import { IFeatureCollection } from '@yohira/extensions.features/IFeatureCollection';
import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { HttpContext } from '@yohira/http/HttpContext';
import { Container, injectable } from 'inversify';
import { IncomingMessage, ServerResponse } from 'node:http';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Http/DefaultHttpContextFactory.cs,a66c2cafba21597c,references
@injectable()
export class HttpContextFactory implements IHttpContextFactory {
	create = (featureCollection: IFeatureCollection): IHttpContext => {
		const httpContext = new HttpContext(
			featureCollection.get(IncomingMessage)!,
			featureCollection.get(ServerResponse<IncomingMessage>)!,
			featureCollection.get(Container)!,
		);
		// TODO
		return httpContext;
	};

	dispose = (httpContext: IHttpContext): void => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
