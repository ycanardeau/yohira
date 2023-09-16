import { tryGetValue } from '@yohira/base';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication.Abstractions/AuthenticationProperties.cs,07bee9fb5619ff86
/**
 * Dictionary used to store state values about the authentication session.
 */
export class AuthenticationProperties {
	static readonly redirectUriKey = '.redirect';

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

	getString(key: string): string | undefined {
		const tryGetValueResult = tryGetValue(this.items, key);
		return tryGetValueResult.ok ? tryGetValueResult.val : undefined;
	}

	setString(key: string, value: string | undefined): void {
		if (value !== undefined) {
			this.items.set(key, value);
		} else {
			this.items.delete(key);
		}
	}

	/**
	 * Gets or sets whether the authentication session is persisted across multiple requests.
	 */
	get isPersistent(): boolean {
		// TODO
		throw new Error('Method not implemented.');
	}
	set isPersistent(value: boolean) {
		// TODO
		throw new Error('Method not implemented.');
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
		// TODO
		throw new Error('Method not implemented.');
	}
	set issuedUtc(value: number /* REVIEW */ | undefined) {
		// TODO
		throw new Error('Method not implemented.');
	}

	/**
	 * Gets or sets the time at which the authentication ticket expires.
	 */
	get expiresUtc(): number /* REVIEW */ | undefined {
		// TODO
		throw new Error('Method not implemented.');
	}
	set expiresUtc(value: number /* REVIEW */ | undefined) {
		// TODO
		throw new Error('Method not implemented.');
	}
}
