import { ConfigSection } from '@yohira/extensions.config';
import { IConfig } from '@yohira/extensions.config.abstractions';

export const IAuthenticationConfigProvider = Symbol.for(
	'IAuthenticationConfigProvider',
);
// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/IAuthenticationConfigurationProvider.cs,85edd16225f0277c,references
/**
 * Provides an interface for implmenting a construct that provides
 * access to authentication-related configuration sections.
 */
export interface IAuthenticationConfigProvider {
	/**
	 * Gets the {@link ConfigSection} where authentication
	 * options are stored.
	 */
	readonly authenticationConfig: IConfig;
}
