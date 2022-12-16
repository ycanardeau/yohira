import { IFileInfo } from '@/file-providers/IFileInfo';
import { IFileProvider } from '@/file-providers/IFileProvider';
import { NotFoundFileInfo } from '@/file-providers/NotFoundFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NullFileProvider.cs,1eadd59a38c04b6b,references
export class NullFileProvider implements IFileProvider {
	getFileInfo = (subpath: string): IFileInfo => {
		return new NotFoundFileInfo(subpath);
	};
}
