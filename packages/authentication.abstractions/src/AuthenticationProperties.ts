import { tryGetValue } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationProperties.cs,07bee9fb5619ff86
/**
 * Dictionary used to store state values about the authentication session.
 */
export class AuthenticationProperties {
	static readonly issuedUtcKey = '.issued';
	static readonly expiresUtcKey = '.expires';
	static readonly isPersistentKey = '.persistent';
	static readonly redirectUriKey = '.redirect';
	static readonly refreshKey = '.refresh';

	/**
	 * State values about the authentication session.
	 */
	readonly items: Map<string, string | undefined>;

	/**
	 * Collection of parameters that are passed to the authentication handler. These are not intended for
	 * serialization or persistence, only for flowing data between call sites.
	 */
	readonly parameters: Map<string, object | undefined>;

	constructor(
		items: Map<string, string | undefined> | undefined,
		parameters: Map<string, object | undefined> | undefined,
	) {
		this.items = items ?? new Map();
		this.parameters = parameters ?? new Map();
	}

	static create(): AuthenticationProperties {
		return new AuthenticationProperties(undefined, undefined);
	}

	static createWithItems(
		items: Map<string, string | undefined>,
	): AuthenticationProperties {
		return new AuthenticationProperties(items, undefined);
	}

	protected getString(key: string): string | undefined {
		const tryGetValueResult = tryGetValue(this.items, key);
		return tryGetValueResult.ok ? tryGetValueResult.val : undefined;
	}

	protected setString(key: string, value: string | undefined): void {
		if (value !== undefined) {
			this.items.set(key, value);
		} else {
			this.items.delete(key);
		}
	}

	protected getDateTimeOffset(key: string): number | undefined {
		const tryGetValueResult = tryGetValue(this.items, key);
		return tryGetValueResult.ok && tryGetValueResult.val !== undefined
			? new Date(tryGetValueResult.val).getTime()
			: undefined;
	}

	protected setDateTimeOffset(key: string, value: number | undefined): void {
		if (value !== undefined) {
			this.items.set(key, new Date(value).toUTCString());
		} else {
			this.items.delete(key);
		}
	}

	protected getBoolean(key: string): boolean | undefined {
		const tryGetValueResult = tryGetValue(this.items, key);
		return tryGetValueResult.ok
			? tryGetValueResult.val === 'true'
				? true
				: tryGetValueResult.val === 'false'
					? false
					: undefined
			: undefined;
	}

	protected setBoolean(key: string, value: boolean | undefined): void {
		if (value !== undefined) {
			this.items.set(key, value ? 'true' : 'false');
		} else {
			this.items.delete(key);
		}
	}

	/**
	 * Gets or sets whether the authentication session is persisted across multiple requests.
	 */
	get isPersistent(): boolean {
		return (
			this.getString(AuthenticationProperties.isPersistentKey) !==
			undefined
		);
	}
	set isPersistent(value: boolean) {
		this.setString(
			AuthenticationProperties.isPersistentKey,
			value ? '' : undefined,
		);
	}

	get redirectUri(): string | undefined {
		return this.getString(AuthenticationProperties.redirectUriKey);
	}
	set redirectUri(value: string | undefined) {
		this.setString(AuthenticationProperties.redirectUriKey, value);
	}

	/**
	 * Gets or sets the time at which the authentication ticket was issued.
	 */
	get issuedUtc(): number /* REVIEW */ | undefined {
		return this.getDateTimeOffset(AuthenticationProperties.issuedUtcKey);
	}
	set issuedUtc(value: number /* REVIEW */ | undefined) {
		this.setDateTimeOffset(AuthenticationProperties.issuedUtcKey, value);
	}

	/**
	 * Gets or sets the time at which the authentication ticket expires.
	 */
	get expiresUtc(): number /* REVIEW */ | undefined {
		return this.getDateTimeOffset(AuthenticationProperties.expiresUtcKey);
	}
	set expiresUtc(value: number /* REVIEW */ | undefined) {
		this.setDateTimeOffset(AuthenticationProperties.expiresUtcKey, value);
	}

	/**
	 * Gets or sets if refreshing the authentication session should be allowed.
	 */
	get allowRefresh(): boolean | undefined {
		return this.getBoolean(AuthenticationProperties.refreshKey);
	}
	set allowRefresh(value: boolean | undefined) {
		this.setBoolean(AuthenticationProperties.refreshKey, value);
	}
}
