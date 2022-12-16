import { IFileProvider } from '@yohira/file-providers/IFileProvider';
import { IWebHostEnv } from '@yohira/hosting.abstractions/IWebHostEnv';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
@injectable()
export class HostingEnv implements IWebHostEnv {
	webRootPath!: string;
	webRootFileProvider!: IFileProvider;
	contentRootPath!: string;
}
