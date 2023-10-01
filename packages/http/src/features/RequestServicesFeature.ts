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
	private _requestServices: IServiceProvider | undefined;
	private scope: IServiceScope | undefined;
	private requestServicesSet = false;

	constructor(
		private readonly context: IHttpContext,
		private readonly scopeFactory: IServiceScopeFactory | undefined,
	) {}

	get requestServices(): IServiceProvider {
		if (!this.requestServicesSet && this.scopeFactory !== undefined) {
			this.context.response.registerForDisposeAsync(this);
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

	private isIDisposable(
		scope: object | IDisposable | IAsyncDisposable | undefined,
	): scope is IDisposable {
		return scope !== undefined && 'dispose' in scope;
	}

	private isIAsyncDisposable(
		scope: object | IDisposable | IAsyncDisposable | undefined,
	): scope is IAsyncDisposable {
		return scope !== undefined && 'disposeAsync' in scope;
	}

	async disposeAsync(): Promise<void> {
		if (this.isIAsyncDisposable(this.scope)) {
			// REVIEW
			await this.scope.disposeAsync();
		} else if (this.isIDisposable(this.scope)) {
			this.scope.dispose();
		}

		this.scope = undefined;
		this._requestServices = undefined;

		return Promise.resolve();
	}

	dispose(): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
