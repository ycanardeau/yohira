import { IConfigProvider } from './IConfigProvider';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/ConfigurationDebugViewContext.cs,0a342508d33ff79e,references
export class ConfigDebugViewContext {
	constructor(
		readonly path: string,
		readonly key: string,
		readonly value: string | undefined,
		readonly configProvider: IConfigProvider,
	) {}
}
