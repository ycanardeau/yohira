import { HostingAppDiagnostics } from '@/hosting/HostingAppDiagnostics';
import { IHttpApp } from '@/hosting/IServer';
import { ILogger } from '@/logging/ILogger';
import { TYPES } from '@/types';
import { inject } from 'inversify';

class HostingAppContext {}

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Hosting/Hosting/src/Internal/HostingApplication.cs#L13
export class HostingApp implements IHttpApp<HostingAppContext> {
	private readonly diagnostics: HostingAppDiagnostics;

	constructor(@inject(TYPES.ILogger) logger: ILogger) {
		this.diagnostics = new HostingAppDiagnostics(logger);
	}

	createContext = (): HostingAppContext => {
		return new HostingAppContext(); /* TODO */
	};
}
