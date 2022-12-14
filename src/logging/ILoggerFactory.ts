import { ILogger } from '@/logging/ILogger';
import { IDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/ILoggerFactory.cs,58ac8454251a34b3
export const ILoggerFactory = Symbol.for('ILoggerFactory');
export interface ILoggerFactory extends IDisposable {
	createLogger<T>(categoryName: new (...args: never[]) => T): ILogger<T>;
}
