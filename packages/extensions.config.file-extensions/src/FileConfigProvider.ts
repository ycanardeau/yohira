import { CaseInsensitiveMap, IDisposable } from '@yohira/base';
import { ConfigProvider } from '@yohira/extensions.config';
import { Stream } from 'node:stream';

import { FileConfigSource } from './FileConfigSource';

// https://source.dot.net/#Microsoft.Extensions.Configuration.FileExtensions/FileConfigurationProvider.cs,56fc0e8e704cec9a,references
export abstract class FileConfigProvider
	extends ConfigProvider
	implements IDisposable
{
	constructor(readonly source: FileConfigSource) {
		super();

		// TODO
	}

	toString(): string {
		return `${this.constructor.name} for '${this.source.path}' (${
			this.source.optional ? 'Optional' : 'Required'
		})`;
	}

	abstract loadStream(stream: Stream): Promise<void>;

	private async loadCore(reload: boolean): Promise<void> {
		const file = this.source.fileProvider?.getFileInfo(
			this.source.path ?? '',
		);
		if (file === undefined || !(await file.exists())) {
			if (this.source.optional || reload) {
				this.data = new CaseInsensitiveMap<string | undefined>();
			} else {
				const error = [
					`The configuration file '${this.source.path}' was not found and is not optional.` /* LOC */,
				];
				if (!!file?.physicalPath) {
					error.push(
						` The expected physical path was '${file.physicalPath}'.` /* LOC */,
					);
				}
				throw new Error(error.join('')) /* TODO: handleException */;
			}
		} else {
			// TODO
			throw new Error('Method not implemented.');
		}
	}

	load(): Promise<void> {
		return this.loadCore(false);
	}

	dispose(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
