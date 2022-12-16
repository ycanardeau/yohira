import { IFileInfo } from '@yohira/file-providers/IFileInfo';
import { IFileProvider } from '@yohira/file-providers/IFileProvider';
import { NotFoundFileInfo } from '@yohira/file-providers/NotFoundFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NullFileProvider.cs,1eadd59a38c04b6b,references
export class NullFileProvider implements IFileProvider {
	getFileInfo = (subpath: string): IFileInfo => {
		return new NotFoundFileInfo(subpath);
	};
}
