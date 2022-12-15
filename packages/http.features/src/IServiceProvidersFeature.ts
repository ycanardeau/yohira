import { IServiceProvider } from '@yohira/dependency-injection.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IServiceProvidersFeature.cs,d56cee5d16e9cf41,references
export interface IServiceProvidersFeature {
	requestServices: IServiceProvider;
}
