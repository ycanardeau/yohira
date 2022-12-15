import { interfaces } from 'inversify';

// https://source.dot.net/#System.ComponentModel/System/IServiceProvider.cs,03aa8a3a87219ddd,references
export interface IServiceProvider {
	getRequiredService<T>(
		serviceIdentifier: interfaces.ServiceIdentifier<T>,
	): T;
	getRequiredNamedService<T>(
		serviceIdentifier: interfaces.ServiceIdentifier<T>,
		named: string | number | symbol,
	): T;
	getRequiredServices<T>(
		serviceIdentifier: interfaces.ServiceIdentifier<T>,
	): T[];
	getNamedRequiredServices<T>(
		serviceIdentifier: interfaces.ServiceIdentifier<T>,
		named: string | number | symbol,
	): T[];
}
