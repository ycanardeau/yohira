import { IHttpApp } from '@yohira/hosting.server.abstractions/IHttpApp';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

class HostingAppContext {}

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingApplication.cs,91ffdac1d653a48b,references
export class HostingApp implements IHttpApp<HostingAppContext> {
	constructor(private readonly app: RequestDelegate) {}

	createContext = (): HostingAppContext => {
		// TODO
		throw new Error('Method not implemented.');
	};

	processRequest = (context: HostingAppContext): Promise<void> => {
		// TODO
		throw new Error('Method not implemented.');
	};

	disposeContext = (
		context: HostingAppContext,
		error: Error | undefined,
	): void => {
		// TODO
		throw new Error('Method not implemented.');
	};
}
