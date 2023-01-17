import { IDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Hosting.Abstractions/IHost.cs,3bdbcb83576750f8,references
export interface IHost extends IDisposable {
	start(/* TODO: cancellationToken */): Promise<void>;
	stop(/* TODO: cancellationToken */): Promise<void>;
}
