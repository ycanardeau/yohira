import { tryGetValue } from '@yohira/base';
import { IConfigBuilder } from '@yohira/extensions.config.abstractions';
import {
	IFileProvider,
	PhysicalFileProvider,
} from '@yohira/extensions.file-providers';
import { cwd } from 'node:process';

const fileProviderKey = 'FileProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationExtensions.cs,c698110ee0a4f0aa,references
export function getFileProvider(builder: IConfigBuilder): IFileProvider {
	const tryGetValueResult = tryGetValue(builder.properties, fileProviderKey);
	if (tryGetValueResult.ok) {
		return tryGetValueResult.val as IFileProvider;
	}

	return new PhysicalFileProvider(cwd() /* REVIEW */ ?? '');
}
