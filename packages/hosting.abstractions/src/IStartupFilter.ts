import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting.Abstractions/IStartupFilter.cs,030a06c206594c44,references
export interface IStartupFilter {
	configure(next: (app: IAppBuilder) => void): (app: IAppBuilder) => void;
}
