import { IConfigSection } from '@yohira/extensions.config.abstractions/IConfigSection';

// https://source.dot.net/#Microsoft.Extensions.Configuration.Abstractions/IConfiguration.cs,168064d5c8bd0f8d,references
export interface IConfig {
	get(key: string): string | undefined;
	set(key: string, value: string | undefined): void;
	getSection(key: string): IConfigSection;
	getChildren(): IConfigSection[];
}
