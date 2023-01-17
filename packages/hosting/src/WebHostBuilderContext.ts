import { IWebHostEnv } from '@yohira/hosting.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/WebHostBuilderContext.cs,0668c64ef2124ad1,references
export class WebHostBuilderContext {
	hostingEnv!: IWebHostEnv;
}
