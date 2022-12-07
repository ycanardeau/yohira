import { IContentTypeProvider } from '@/middleware/staticFiles/IContentTypeProvider';
import { Result } from 'ts-results';

// https://source.dot.net/#Microsoft.AspNetCore.StaticFiles/FileExtensionContentTypeProvider.cs,318e05af289b0b3e,references
export class FileExtensionContentTypeProvider implements IContentTypeProvider {
	tryGetContentType = (subpath: string): Result<string, undefined> => {
		throw new Error('Method not implemented.');
	};
}
