import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IAppBuilder } from '@yohira/http.abstractions';

import { ISupportsStartup } from './infrastructure/ISupportsStartup';

function isISupportsStartup(
	hostBuilder: IWebHostBuilder | ISupportsStartup,
): hostBuilder is ISupportsStartup {
	return 'configure' in hostBuilder;
}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/WebHostBuilderExtensions.cs,660aae01ddc11d31,references
export function configure(
	hostBuilder: IWebHostBuilder | ISupportsStartup,
	configureApp: (
		/* TODO: context: WebHostBuilderContext, */ app: IAppBuilder,
	) => void,
): IWebHostBuilder {
	// TODO

	if (isISupportsStartup(hostBuilder)) {
		return hostBuilder.configure(configureApp);
	}

	// TODO

	return hostBuilder.configureServices((/* TODO */) => {
		// TODO
		throw new Error('Method not implemented.');
	});
}
