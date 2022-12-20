import { IDisposable } from '@yohira/base/IDisposable';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHost.cs,3bdbcb83576750f8,references
export const IHost = Symbol.for('IHost');
export interface IHost extends IDisposable {
	start(/* TODO: cancellationToken */): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
