import { IFileInfo } from './IFileInfo';

// https://source.dot.net/#Microsoft.Extensions.FileProviders.Abstractions/IFileProvider.cs,8f034709bc42437d,references
export interface IFileProvider {
	getFileInfoSync(subpath: string): IFileInfo;
}
