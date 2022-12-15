import { IDisposable } from '@yohira/base';
import { IServiceProvider } from '@yohira/dependency-injection.abstractions';

import { IServiceProvidersFeature } from './IServiceProvidersFeature';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/RequestServicesFeature.cs,108ec86c767ee7c3,references
export class RequestServicesFeature
	implements IServiceProvidersFeature, IDisposable
{
	get requestServices(): IServiceProvider {
		// TODO
		throw new Error('Method not implemented.');
	}
	set requestServices(value: IServiceProvider) {
		// TODO
		throw new Error('Method not implemented.');
	}

	dispose(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
