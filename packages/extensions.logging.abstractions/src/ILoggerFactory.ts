import { IDisposable } from '@yohira/base/IDisposable';
import { Ctor } from '@yohira/base/Type';
import { ILogger } from '@yohira/extensions.logging.abstractions/ILogger';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/ILoggerFactory.cs,58ac8454251a34b3
export const ILoggerFactory = Symbol.for('ILoggerFactory');
export interface ILoggerFactory extends IDisposable {
	createLogger<T>(categoryName: Ctor<T>): ILogger<T>;
}
