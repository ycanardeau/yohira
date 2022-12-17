import { IWebHostBuilder } from '@yohira/hosting.abstractions/IWebHostBuilder';
import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/WebHostBuilderExtensions.cs,660aae01ddc11d31,references
export const configure = (
	hostBuilder: IWebHostBuilder,
	configureApp: (
		/* TODO: context: WebHostBuilderContext, */ app: IAppBuilder,
	) => void,
): IWebHostBuilder => {
	// TODO

	return hostBuilder.configureServices((/* TODO */) => {
		// TODO
		throw new Error('Method not implemented.');
	});
};
