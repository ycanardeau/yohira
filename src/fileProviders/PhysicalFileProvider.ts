import { IDisposable } from '@/base/IDisposable';
import { IFileInfo } from '@/fileProviders/IFileInfo';
import { IFileProvider } from '@/fileProviders/IFileProvider';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Physical/PhysicalFileProvider.cs,deeb5176dbadb21d,references
export class PhysicalFileProvider implements IFileProvider, IDisposable {
	constructor(root: string) {}

	dispose = async (): Promise<void> => {
		// TODO
	};

	getFileInfo = (subpath: string): IFileInfo => {
		throw new Error('Method not implemented.');
	};
}
