import { IServiceProvider } from '@yohira/base';
import {
	IServiceScope,
	IServiceScopeFactory,
} from '@yohira/extensions.dependency-injection.abstractions';
import { IHttpContext } from '@yohira/http.abstractions';
import { IServiceProvidersFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/RequestServicesFeature.cs,108ec86c767ee7c3,references
export class RequestServicesFeature
	implements IServiceProvidersFeature, Disposable, AsyncDisposable
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

	private isDisposable(
		scope: object | Disposable | AsyncDisposable | undefined,
	): scope is Disposable {
		return scope !== undefined && Symbol.dispose in scope;
	}

	private isAsyncDisposable(
		scope: object | Disposable | AsyncDisposable | undefined,
	): scope is AsyncDisposable {
		return scope !== undefined && Symbol.asyncDispose in scope;
	}

	async [Symbol.asyncDispose](): Promise<void> {
		if (this.isAsyncDisposable(this.scope)) {
			// REVIEW
			await this.scope[Symbol.asyncDispose]();
		} else if (this.isDisposable(this.scope)) {
			this.scope[Symbol.dispose]();
		}

		this.scope = undefined;
		this._requestServices = undefined;

		return Promise.resolve();
	}

	[Symbol.dispose](): void {
		// TODO
		throw new Error('Method not implemented.');
	}
}
