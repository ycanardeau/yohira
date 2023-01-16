import { tryGetValue } from '@yohira/base/MapExtensions';
import { getFullPath } from '@yohira/base/Path';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions/IConfigBuilder';
import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { PhysicalFileProvider } from '@yohira/extensions.file-providers/PhysicalFileProvider';
import { cwd } from 'node:process';

const fileProviderKey = 'FileProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationExtensions.cs,c698110ee0a4f0aa,references
export function getFileProvider(builder: IConfigBuilder): IFileProvider {
	const tryGetValueResult = tryGetValue(builder.properties, fileProviderKey);
	if (tryGetValueResult.ok) {
		return tryGetValueResult.val as IFileProvider;
	}

	return new PhysicalFileProvider(getFullPath(cwd()) /* REVIEW */ ?? '');
}
