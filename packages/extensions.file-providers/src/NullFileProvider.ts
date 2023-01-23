import { IFileInfo } from './IFileInfo';
import { IFileProvider } from './IFileProvider';
import { NotFoundFileInfo } from './NotFoundFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/NullFileProvider.cs,1eadd59a38c04b6b,references
export class NullFileProvider implements IFileProvider {
	getFileInfo(subpath: string): Promise<IFileInfo> {
		return Promise.resolve(new NotFoundFileInfo(subpath));
	}
}
