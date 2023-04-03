import { DirectoryInfo, XElement, combinePaths } from '@yohira/base';
import {
	ILogger,
	ILoggerFactory,
	LogLevel,
} from '@yohira/extensions.logging.abstractions';
import { readFileSync, readdirSync } from 'node:fs';

import { IXmlRepository } from './IXmlRepository';

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/LoggingExtensions.cs,26fd826932e51f13,references
function logReadingDataFromFile(logger: ILogger, fullPath: string): void {
	logger.log(LogLevel.Debug, `Reading data from file '${fullPath}'.`);
}

// https://source.dot.net/#Microsoft.AspNetCore.DataProtection/Repositories/FileSystemXmlRepository.cs,89ece036966ce6f8,references
export class FileSystemXmlRepository implements IXmlRepository {
	private readonly logger: ILogger;

	constructor(
		readonly directory: DirectoryInfo,
		loggerFactory: ILoggerFactory,
	) {
		this.logger = loggerFactory.createLogger(FileSystemXmlRepository.name);

		// TODO: detect docker
	}

	private readElementFromFile(fullPath: string): XElement {
		logReadingDataFromFile(this.logger, fullPath);

		return XElement.parse(readFileSync(fullPath, 'utf8'));
	}

	private *getAllElementsCore(): Generator<XElement> {
		this.directory.createSync();

		// Find all files matching the pattern "*.xml".
		// Note: Inability to read any file is considered a fatal error (since the file may contain
		// revocation information), and we'll fail the entire operation rather than return a partial
		// set of elements. If a file contains well-formed XML but its contents are meaningless, we
		// won't fail that operation here. The caller is responsible for failing as appropriate given
		// that scenario.
		for (const dirent of readdirSync(
			combinePaths(this.directory.fullName),
			{ withFileTypes: true },
		).filter((dirent) => dirent.isFile() && dirent.name.endsWith('.xml'))) {
			yield this.readElementFromFile(
				combinePaths(this.directory.fullName, dirent.name),
			);
		}
	}

	getAllElements(): readonly XElement[] {
		// forces complete enumeration
		return Array.from(this.getAllElementsCore());
	}
}
