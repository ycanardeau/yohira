import { IDisposable } from '@/base/IDisposable';
import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';
import { NotFoundFileInfo } from '@/fileProviders/NotFoundFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileProvider.cs,deeb5176dbadb21d,references
export class PhysicalFileProvider implements IFileProvider, IDisposable {
	constructor(root: string) {}

	dispose = async (): Promise<void> => {
		// TODO
	};

	getFileInfo = (subpath: string): IFileInfo => {
		// TODO
		return new NotFoundFileInfo(subpath);
	};
}
