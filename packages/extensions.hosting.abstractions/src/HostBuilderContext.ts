import { IConfig } from '@yohira/extensions.config.abstractions';

import { IHostEnv } from './IHostEnv';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/HostBuilderContext.cs,c05e9bb195a831c5,references
export class HostBuilderContext {
	hostingEnv!: IHostEnv;
	config!: IConfig;
}
