import { IFileProvider } from '@yohira/extensions.file-providers';
import { IWebHostEnv } from '@yohira/hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
export class HostingEnv implements IWebHostEnv {
	webRootPath!: string;
	webRootFileProvider!: IFileProvider;
	contentRootPath!: string;
}
