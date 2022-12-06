import { RequestDelegate } from '@/http/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,8bf924cdca3bdd9e,references
export interface IAppBuilder {
	// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/IApplicationBuilder.cs,55520ccfac9ccf91,references
	use(middleware: (next: RequestDelegate) => RequestDelegate): this;
}
