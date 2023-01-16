import { RequestDelegate } from '@/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,8bf924cdca3bdd9e,references
export interface IAppBuilder {
	use(middleware: (next: RequestDelegate) => RequestDelegate): this;
	build(): RequestDelegate;
}
