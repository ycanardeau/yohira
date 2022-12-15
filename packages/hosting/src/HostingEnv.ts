import { IFileProvider } from '@yohira/file-providers';
import { injectable } from 'inversify';

import { IWebHostEnv } from './IWebHostEnv';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
@injectable()
export class HostingEnv implements IWebHostEnv {
	webRootPath!: string;
	webRootFileProvider!: IFileProvider;
	contentRootPath!: string;
}
