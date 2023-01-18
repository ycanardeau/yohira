import { IServiceProvider, tryGetValue } from '@yohira/base';
import { IAppBuilder, RequestDelegate } from '@yohira/http.abstractions';

const appServicesKey = 'application.Services';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Builder/ApplicationBuilder.cs,036bfc42ede25c42,references
export class AppBuilder implements IAppBuilder {
	private readonly components: ((
		next: RequestDelegate,
	) => RequestDelegate)[] = [];

	readonly properties: Map<string, unknown>;

	private getProperty<T>(key: string): T | undefined {
		const tryGetValueResult = tryGetValue(this.properties, key);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val as T;
		}
		return undefined;
	}

	private setProperty<T>(key: string, value: T): void {
		this.properties.set(key, value);
	}

	get appServices(): IServiceProvider {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this.getProperty<IServiceProvider>(appServicesKey)!;
	}
	set appServices(value: IServiceProvider) {
		this.setProperty<IServiceProvider>(appServicesKey, value);
	}

	constructor(serviceProvider: IServiceProvider) {
		this.properties = new Map<string, unknown>();
		this.appServices = serviceProvider;

		// TODO
	}

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
