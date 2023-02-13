import { addSingletonCtor } from '@yohira/extensions.dependency-injection.abstractions';
import { configureOptionsServices } from '@yohira/extensions.options';
import { WebHostBuilderContext } from '@yohira/hosting';
import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IServer } from '@yohira/hosting.server.abstractions';
import { NodeServerImpl, NodeServerOptions } from '@yohira/server.node.core';

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel/WebHostBuilderKestrelExtensions.cs,01b0faf0417d31d6,references
function configureNode(
	hostBuilder: IWebHostBuilder,
	configureOptions: (
		builderContext: WebHostBuilderContext,
		options: NodeServerOptions,
	) => void,
): IWebHostBuilder {
	return hostBuilder.configureServices((context, services) => {
		// TODO
		configureOptionsServices(NodeServerOptions, services, (options) => {
			configureOptions(context, options);
		});
	});
}

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel/WebHostBuilderKestrelExtensions.cs,74284f5344f37638,references
function useNodeCore(hostBuilder: IWebHostBuilder): IWebHostBuilder {
	hostBuilder.configureServices((context, services) => {
		// TODO

		// TODO
		addSingletonCtor(services, IServer, NodeServerImpl);
	});

	// TODO

	return hostBuilder;
}

// https://source.dot.net/#Microsoft.AspNetCore.Server.Kestrel/WebHostBuilderKestrelExtensions.cs,2987a0db3c014a11,references
export function useNode(
	hostBuilder: IWebHostBuilder,
	configureOptions: (
		builderContext: WebHostBuilderContext,
		options: NodeServerOptions,
	) => void,
): IWebHostBuilder {
	let $: IWebHostBuilder;
	$ = useNodeCore(hostBuilder);
	$ = configureNode($, configureOptions);
	return $;
}
