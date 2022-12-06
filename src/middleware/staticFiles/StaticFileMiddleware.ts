import { App } from '@/App';
import { IHttpContext } from '@/http/IHttpContext';
import { IMiddleware } from '@/http/IMiddleware';
import { RequestDelegate } from '@/http/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs,ae588cf9ea8c8a24,references
export class StaticFileMiddleware implements IMiddleware {
	invoke = (context: IHttpContext, next: RequestDelegate): Promise<void> => {
		return next(context);
	};
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs,d2a2db085a036bf0,references
export const useStaticFiles = (app: App): App => {
	return app.useMiddleware(StaticFileMiddleware);
};
