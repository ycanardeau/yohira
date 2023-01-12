import { IFileInfo } from '@yohira/extensions.file-providers/IFileInfo';
import { IFileProvider } from '@yohira/extensions.file-providers/IFileProvider';
import { NotFoundFileInfo } from '@yohira/extensions.file-providers/NotFoundFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NullFileProvider.cs,1eadd59a38c04b6b,references
export class NullFileProvider implements IFileProvider {
	getFileInfo(subpath: string): IFileInfo {
		return new NotFoundFileInfo(subpath);
	}
}
