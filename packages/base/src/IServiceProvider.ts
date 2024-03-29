export const IServiceProvider = Symbol.for('IServiceProvider');
// https://source.dot.net/#System.ComponentModel/System/IServiceProvider.cs,03aa8a3a87219ddd,references
export interface IServiceProvider {
	getService<T>(serviceType: symbol): T | undefined;
}
