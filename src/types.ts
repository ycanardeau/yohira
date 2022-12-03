const TYPES = {
	IConfigureOptions: Symbol.for('IConfigureOptions'),
	IHostedService: Symbol.for('IHostedService'),
	IOptions: Symbol.for('IOptions'),
} as const;

export { TYPES };
