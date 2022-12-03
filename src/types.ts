const TYPES = {
	IConfigureOptions: Symbol.for('IConfigureOptions'),
	IHostedService: Symbol.for('IHostedService'),
	ILogger: Symbol.for('ILogger'),
	ILoggerFactory: Symbol.for('ILoggerFactory'),
	IOptions: Symbol.for('IOptions'),
	IOptionsFactory: Symbol.for('IOptionsFactory'),
	IServer: Symbol.for('IServer'),
} as const;

export { TYPES };
