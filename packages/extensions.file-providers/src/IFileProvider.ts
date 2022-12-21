import { IFileInfo } from '@yohira/extensions.file-providers/IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/IFileProvider.cs,8f034709bc42437d,references
export interface IFileProvider {
	getFileInfo(subpath: string): IFileInfo;
}
