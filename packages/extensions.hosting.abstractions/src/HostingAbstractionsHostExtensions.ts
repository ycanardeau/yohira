import { IHost } from '@yohira/extensions.hosting.abstractions/IHost';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ad617e075364b8b3,references
export const waitForShutdown = async (host: IHost): Promise<void> => {
	// TODO

	await host.stop();
};

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostingAbstractionsHostExtensions.cs,ddd71cc5c5437524,references
export const run = async (host: IHost): Promise<void> => {
	try {
		await host.start();

		await waitForShutdown(host);
	} finally {
		await host.dispose();
	}
};
