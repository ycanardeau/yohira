export interface IOptionsFactory<TOptions> {
	create(
		TOptions: new (...args: never[]) => TOptions,
		name: string,
	): TOptions;
}
