import { IAsyncDisposable, IDisposable, IServiceProvider } from '@yohira/base';
import {
	IServiceScope,
	IServiceScopeFactory,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { IServiceProvidersFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/RequestServicesFeature.cs,108ec86c767ee7c3,references
export class RequestServicesFeature
	implements IServiceProvidersFeature, IDisposable, IAsyncDisposable
{
	private _requestServices?: IServiceProvider;
	private scope?: IServiceScope;
	private requestServicesSet = false;

	constructor(
		private readonly context: IHttpContext,
		private readonly scopeFactory: IServiceScopeFactory | undefined,
	) {}

	get requestServices(): IServiceProvider {
		if (!this.requestServicesSet && this.scopeFactory !== undefined) {
			// TODO: this.context.response.registerForDisposeAsync(this);
			this.scope = this.scopeFactory.createScope();
			this._requestServices = this.scope.serviceProvider;
			this.requestServicesSet = true;
		}
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return this._requestServices!;
	}
	set requestServices(value: IServiceProvider) {
		this._requestServices = value;
		this.requestServicesSet = true;
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}

	disposeAsync(): Promise<void> {
		// TODO
		throw new Error('Method not implemented.');
	}
}
