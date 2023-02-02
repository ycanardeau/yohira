import { IAppBuilder } from '../IAppBuilder';
import { RequestDelegate } from '../RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/RunExtensions.cs,04de4892e36f72e3,references
export function addTerminalMiddleware(
	app: IAppBuilder,
	handler: RequestDelegate,
): void {
	app.use(() => handler);
}
