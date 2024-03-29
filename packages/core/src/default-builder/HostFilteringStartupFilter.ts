import { IStartupFilter } from '@yohira/hosting.abstractions';
import { IAppBuilder } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore/HostFilteringStartupFilter.cs,2e65c6fa6e26c8e9,references
export class HostFilteringStartupFilter implements IStartupFilter {
	configure(next: (app: IAppBuilder) => void): (app: IAppBuilder) => void {
		return (app) => {
			// TODO
			next(app);
		};
	}
}
