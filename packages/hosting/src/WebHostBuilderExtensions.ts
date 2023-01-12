import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { ISupportsStartup } from '@yohira/hosting/infrastructure/ISupportsStartup';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/WebHostBuilderExtensions.cs,660aae01ddc11d31,references
export function configure(
	hostBuilder: IWebHostBuilder | ISupportsStartup,
	configureApp: (
		/* TODO: context: WebHostBuilderContext, */ app: IAppBuilder,
	) => void,
): IWebHostBuilder {
	// TODO

	if ('configure' in /* TODO */ hostBuilder) {
		return hostBuilder.configure(configureApp);
	}

	// TODO

	return hostBuilder.configureServices((/* TODO */) => {
		// TODO
		throw new Error('Method not implemented.');
	});
}
