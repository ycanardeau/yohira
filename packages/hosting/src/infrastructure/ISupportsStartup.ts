import { IWebHostBuilder } from '@yohira/hosting.abstractions';
import { IAppBuilder } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Hosting/Infrastructure/ISupportsStartup.cs,7b8b79570eca26db,references
export interface ISupportsStartup {
	configure(
		configure: (/* TODO */ app: IAppBuilder) => void,
	): IWebHostBuilder;
}
