import { IServiceProvider } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.DependencyInjection.Abstractions/IServiceScope.cs,a5d1d201c0688484,references
export interface IServiceScope extends Disposable {
	/**
	 * The {@link IServiceProvider} used to resolve dependencies from the scope.
	 */
	readonly serviceProvider: IServiceProvider;
}
