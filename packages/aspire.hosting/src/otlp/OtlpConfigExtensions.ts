import { IConfig } from '@yohira/extensions.config.abstractions';
import { IHostEnv } from '@yohira/extensions.hosting.abstractions';

import { IResource } from '../application-model/IResource';
import { IResourceBuilder } from '../application-model/IResourceBuilder';
import { IResourceWithEnv } from '../application-model/IResourceWithEnv';

// https://github.com/dotnet/aspire/blob/4769f758b5337f01462664f7f930ba87a453887f/src/Aspire.Hosting/Otlp/OtlpConfigurationExtensions.cs#L25
/**
 * Configures OpenTelemetry in projects using environment variables.
 * @param resource The resource to add annotations to.
 * @param config The configuration to use for the OTLP exporter endpoint URL.
 * @param env The host environment to check if the application is running in development mode.
 */
export function addOtlpEnv(
	resource: IResource,
	config: IConfig,
	env: IHostEnv,
): void {
	// TODO
	//throw new Error('Method not implemented.');
}

// https://github.com/dotnet/aspire/blob/4769f758b5337f01462664f7f930ba87a453887f/src/Aspire.Hosting/Otlp/OtlpConfigurationExtensions.cs#L68
/**
 * Injects the appropriate environment variables to allow the resource to enable sending telemetry to the dashboard.
 * 1. It sets the OTLP endpoint to the value of the DOTNET_DASHBOARD_OTLP_ENDPOINT_URL environment variable.
 * 2. It sets the service name and instance id to the resource name and UID. Values are injected by the orchestrator.
 * 3. It sets a small batch schedule delay in development. This reduces the delay that OTLP exporter waits to sends telemetry and makes the dashboard telemetry pages responsive.
 * @param builder The resource builder.
 * @returns The {@link IResourceBuilder}.
 */
export function withOtlpExporter<T extends IResourceWithEnv>(
	builder: IResourceBuilder<T>,
): IResourceBuilder<T> {
	addOtlpEnv(
		builder.resource,
		builder.appBuilder.config,
		builder.appBuilder.env,
	);
	return builder;
}
