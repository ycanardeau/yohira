import { IAsyncDisposable } from '@yohira/base';

import { IHost } from './IHost';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ad617e075364b8b3,references
export async function waitForShutdown(host: IHost): Promise<void> {
	// TODO

	await new Promise(() => {
		// TODO: resolve
	});

	await host.stop();
}

function isIAsyncDisposable(
	host: IHost | (IHost & IAsyncDisposable),
): host is IHost & IAsyncDisposable {
	return 'disposeAsync' in host;
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ddd71cc5c5437524,references
export async function runApp(
	host: IHost | (IHost & IAsyncDisposable),
): Promise<void> {
	try {
		await host.start();

		await waitForShutdown(host);
	} finally {
		if (isIAsyncDisposable(host)) {
			await host.disposeAsync();
		} else {
			host.dispose();
		}
	}
}
