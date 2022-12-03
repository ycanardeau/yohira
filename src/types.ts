const TYPES = {
	IConfigureOptions: Symbol.for('IConfigureOptions'),
	IHostedService: Symbol.for('IHostedService'),
	IOptions: Symbol.for('IOptions'),
	IOptionsFactory: Symbol.for('IOptionsFactory'),
} as const;

export { TYPES };
