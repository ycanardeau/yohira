import { IAuthenticationConfigProvider } from '@yohira/authentication.abstractions';
import { IConfig } from '@yohira/extensions.config.abstractions';

export class DefaultAuthenticationConfigProvider
	implements IAuthenticationConfigProvider
{
	private static readonly authenticationKey = 'Authentication';

	constructor(private readonly config: IConfig) {}

	get authenticationConfig(): IConfig {
		return this.config.getSection(
			DefaultAuthenticationConfigProvider.authenticationKey,
		);
	}
}
