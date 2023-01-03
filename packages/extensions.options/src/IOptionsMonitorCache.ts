// https://source.dot.net/#Microsoft.Extensions.Options/IOptionsMonitorCache.cs,6ee22297f79cab52,references
export interface IOptionsMonitorCache<TOptions> {
	getOrAdd(name: string | undefined, createOptions: () => TOptions): TOptions;
	tryAdd(name: string | undefined, options: TOptions): boolean;
	tryRemove(name: string | undefined): boolean;
	clear(): void;
}
