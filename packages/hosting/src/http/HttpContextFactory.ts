import { IHttpContext } from '@yohira/http.abstractions/IHttpContext';
import { IHttpContextFactory } from '@yohira/http.abstractions/IHttpContextFactory';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Http/DefaultHttpContextFactory.cs,a66c2cafba21597c,references
@injectable()
export class HttpContextFactory implements IHttpContextFactory {
	create = (): IHttpContext => {
		// TODO
		throw new Error('Method not implemented.');
	};

	dispose = (httpContext: IHttpContext): void => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
