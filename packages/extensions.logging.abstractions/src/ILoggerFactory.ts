import { ILogger } from '@/ILogger';
import { IDisposable } from '@yohira/base';

// https://source.dot.net/#Microsoft.Extensions.Logging.Abstractions/ILoggerFactory.cs,58ac8454251a34b3
export interface ILoggerFactory extends IDisposable {
	createLogger(categoryName: string): ILogger;
}
