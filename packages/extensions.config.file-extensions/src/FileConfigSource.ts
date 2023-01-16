import { getFileProvider } from '@/FileConfigExtensions';
import {
	IConfigBuilder,
	IConfigProvider,
	IConfigSource,
} from '@yohira/extensions.config.abstractions';
import { IFileProvider } from '@yohira/extensions.file-providers';

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationSource.cs,dbf92158ddc162f0,references
export abstract class FileConfigSource implements IConfigSource {
	/**
	 * Used to access the contents of the file.
	 */
	fileProvider?: IFileProvider;
	/**
	 * The path to the file.
	 */
	path?: string;
	/**
	 * Determines if loading the file is optional.
	 */
	optional = false;

	ensureDefaults(builder: IConfigBuilder): void {
		this.fileProvider ??= getFileProvider(builder);
		// TODO
	}

	abstract build(builder: IConfigBuilder): IConfigProvider;
}
