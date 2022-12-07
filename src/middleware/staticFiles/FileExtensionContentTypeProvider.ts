import { IContentTypeProvider } from '@/middleware/staticFiles/IContentTypeProvider';
import { Err, Ok, Result } from 'ts-results';

// TODO: Move.
const isNullOrWhiteSpace = (value: string | undefined): boolean => {
	return !value || !value.trim();
};

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/FileExtensionContentTypeProvider.cs,318e05af289b0b3e,references
export class FileExtensionContentTypeProvider implements IContentTypeProvider {
	private static getExtension = (path: string): string | undefined => {
		if (isNullOrWhiteSpace(path)) {
			return undefined;
		}

		const index = path.lastIndexOf('.');
		if (index < 0) {
			return undefined;
		}

		return path.substring(index);
	};

	tryGetContentType = (subpath: string): Result<string, undefined> => {
		const extension =
			FileExtensionContentTypeProvider.getExtension(subpath);
		if (!extension) {
			return Err(undefined);
		}
		return Ok('' /* TODO */);
	};
}
