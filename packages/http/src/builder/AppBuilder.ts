import { IAppBuilder } from '@yohira/http.abstractions/IAppBuilder';
import { RequestDelegate } from '@yohira/http.abstractions/RequestDelegate';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,036bfc42ede25c42,references
export class AppBuilder implements IAppBuilder {
	private readonly components: ((
		next: RequestDelegate,
	) => RequestDelegate)[] = [];

	// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,51e168cb3e82bac8,references
	use(middleware: (next: RequestDelegate) => RequestDelegate): this {
		this.components.push(middleware);
		return this;
	}

	// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,4bdd7f36d734b764,references
	build(): RequestDelegate {
		let app: RequestDelegate = () => {
			return Promise.resolve();
		};

		for (let c = this.components.length - 1; c >= 0; c--) {
			app = this.components[c](app);
		}

		return app;
	}
}
