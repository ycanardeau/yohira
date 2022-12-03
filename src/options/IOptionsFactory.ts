export interface IOptionsFactory<TOptions> {
	create(name: string): TOptions;
}
