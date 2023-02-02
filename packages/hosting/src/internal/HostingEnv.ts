import { IFileProvider } from '@yohira/extensions.file-providers';
import { Envs } from '@yohira/extensions.hosting.abstractions';
import { IWebHostEnv } from '@yohira/hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
export class HostingEnv implements IWebHostEnv {
	envName: string = Envs.Production;
	webRootPath!: string;
	webRootFileProvider!: IFileProvider;
	contentRootPath!: string;
}
