import { IFileProvider } from '@/fileProviders/IFileProvider';
import { IWebHostEnv } from '@/hosting/IWebHostEnv';
import { injectable } from 'inversify';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Internal/HostingEnvironment.cs,0e08dcc04b780183,references
@injectable()
export class HostingEnv implements IWebHostEnv {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootPath: string = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	webRootFileProvider: IFileProvider = undefined!;
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	contentRootPath: string = undefined!;
}
