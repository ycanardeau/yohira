import { IHost } from '@/IHost';
import { IAsyncDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ad617e075364b8b3,references
export async function waitForShutdown(host: IHost): Promise<void> {
	// TODO

	await new Promise(() => {
		// TODO: resolve
	});

	await host.stop();
}

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ddd71cc5c5437524,references
export async function run(
	host: IHost | (IHost & IAsyncDisposable),
): Promise<void> {
	try {
		await host.start();

		await waitForShutdown(host);
	} finally {
		if ('disposeAsync' in host) {
			await host.disposeAsync();
		} else {
			host.dispose();
		}
	}
}
