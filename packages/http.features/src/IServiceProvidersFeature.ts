import { IServiceProvider } from '@yohira/base';

export const IServiceProvidersFeature = Symbol.for('IServiceProvidersFeature');
// https://source.dot.net/#Microsoft.AspNetCore.Http.Features/IServiceProvidersFeature.cs,d56cee5d16e9cf41,references
/**
 * Provides access to the request-scoped {@link IServiceProvider}.
 */
export interface IServiceProvidersFeature {
	/**
	 * Gets or sets the {@link IServiceProvider} scoped to the current request.
	 */
	requestServices: IServiceProvider;
}
