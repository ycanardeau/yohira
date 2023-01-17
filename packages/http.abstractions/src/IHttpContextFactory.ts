import { IFeatureCollection } from '@yohira/extensions.features';

import { IHttpContext } from './IHttpContext';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IHttpContextFactory.cs,06b07e148b00ced6,references
export interface IHttpContextFactory {
	create(featureCollection: IFeatureCollection): IHttpContext;
	dispose(httpContext: IHttpContext): void;
}
