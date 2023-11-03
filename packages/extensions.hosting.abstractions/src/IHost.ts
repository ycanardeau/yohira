import { IServiceProvider } from '@yohira/base';

export const IHost = Symbol.for('IHost');
// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHost.cs,3bdbcb83576750f8,references
export interface IHost extends AsyncDisposable {
	readonly services: IServiceProvider;
	start(/* TODO: cancellationToken */): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
