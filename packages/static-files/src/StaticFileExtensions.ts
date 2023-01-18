import { IAppBuilder, useMiddleware } from '@yohira/http.abstractions';

import { StaticFileMiddleware } from './StaticFileMiddleware';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/StaticFileExtensions.cs,d2a2db085a036bf0,references
export function useStaticFiles(app: IAppBuilder): IAppBuilder {
	return useMiddleware(StaticFileMiddleware, app);
}
