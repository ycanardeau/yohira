import { ILogger } from '@/logging/ILogger';

// https://github.com/dotnet/aspnetcore/blob/87c8b7869584107f57739b88d246f4d62873c2f0/src/Hosting/Hosting/src/Internal/HostingApplicationDiagnostics.cs#L15
export class HostingAppDiagnostics {
	constructor(logger: ILogger) {}
}
