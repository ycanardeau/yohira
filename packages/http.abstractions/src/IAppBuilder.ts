import { IServiceProvider } from '@yohira/base';

import { RequestDelegate } from './RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,8bf924cdca3bdd9e,references
export interface IAppBuilder {
	appServices: IServiceProvider;
	readonly properties: Map<string, unknown>;
	use(middleware: (next: RequestDelegate) => RequestDelegate): this;
	create(): IAppBuilder;
	build(): RequestDelegate;
}
