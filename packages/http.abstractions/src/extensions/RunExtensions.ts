import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/Extensions/RunExtensions.cs,04de4892e36f72e3,references
export function run(app: IAppBuilder, handler: RequestDelegate): void {
	app.use(() => handler);
}
