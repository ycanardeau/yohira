import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { HttpLoggingMiddleware } from './HttpLoggingMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.HttpLogging/HttpLoggingBuilderExtensions.cs,14542a362047cc35
export function useHttpLogging(app: IAppBuilder): IAppBuilder {
	useMiddleware(app, HttpLoggingMiddleware);
	return app;
}
