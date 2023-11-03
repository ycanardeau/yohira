import { CaseInsensitiveMap, IDisposable } from '@yohira/base';
import { ConfigProvider } from '@yohira/extensions.config';
import { readFileSync } from 'node:fs';
import { Readable, Stream } from 'node:stream';

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

	abstract loadStreamSync(stream: Stream): void;

	private loadCoreSync(reload: boolean): void {
		const file = this.source.fileProvider?.getFileInfoSync(
			this.source.path ?? '',
		);
		if (file === undefined || !file.existsSync()) {
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
			try {
				// TODO: Convert to async function.
				const stream = Readable.from(readFileSync(file.physicalPath!));
				this.loadStreamSync(stream);
			} catch (error) {
				// TODO
				throw error;
			}
		}
	}

	loadSync(): void {
		return this.loadCoreSync(false);
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
