import { tryGetValue } from '@yohira/base';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions';
import {
	IFileProvider,
	PhysicalFileProvider,
} from '@yohira/extensions.file-providers';
import { cwd } from 'node:process';

const fileProviderKey = 'FileProvider';

/**
 * Sets the default <see cref="IFileProvider"/> to be used for file-based providers.
 * @param builder The {@link IConfigBuilder} to add to.
 * @param fileProvider The default file provider instance.
 * @returns The {@link IConfigBuilder}.
 */
function setFileProvider(
	builder: IConfigBuilder,
	fileProvider: IFileProvider,
): IConfigBuilder {
	builder.properties.set(fileProviderKey, fileProvider);
	return builder;
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationExtensions.cs,c698110ee0a4f0aa,references
/**
 * Gets the default {@link IFileProvider} to be used for file-based providers.
 * @param builder The {@link IConfigBuilder}.
 * @returns The default {@link IFileProvider}.
 */
export function getFileProvider(builder: IConfigBuilder): IFileProvider {
	const tryGetValueResult = tryGetValue(builder.properties, fileProviderKey);
	if (tryGetValueResult.ok) {
		return tryGetValueResult.val as IFileProvider;
	}

	return new PhysicalFileProvider(cwd() /* REVIEW */ ?? '');
}

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationExtensions.cs,e37bffb69f315f23,references
/**
 * Sets the FileProvider for file-based providers to a PhysicalFileProvider with the base path.
 * @param builder The {@link IConfigBuilder} to add to.
 * @param basePath The absolute path of file-based providers.
 * @returns The {@link IConfigBuilder}.
 */
export function setBasePath(
	builder: IConfigBuilder,
	basePath: string,
): IConfigBuilder {
	return setFileProvider(builder, new PhysicalFileProvider(basePath));
}
