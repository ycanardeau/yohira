import { App, IHttpContext, RequestDelegate } from '@/App';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileMiddleware.cs,ae588cf9ea8c8a24,references
export class StaticFileMiddleware {
	constructor(private readonly next: RequestDelegate) {}

	invoke = (context: IHttpContext): Promise<void> => {
		return this.next(context);
	};
}

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs,d2a2db085a036bf0,references
export const useStaticFiles = (app: App): App => {
	return app.useMiddleware(StaticFileMiddleware);
};
