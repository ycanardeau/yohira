// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/QueryString.cs,b704925bb788f6c6,references
/**
 * Provides correct handling for QueryString value when needed to reconstruct a request or redirect URI string
 */
export class QueryString {
	/**
	 * Represents the empty query string. This field is read-only.
	 */
	static readonly empty = new QueryString('');

	constructor(readonly value?: string) {
		if (!!value && value[0] !== '?') {
			throw new Error(
				"The leading '?' must be included for a non-empty query.",
			);
		}
	}

	get hasValue(): boolean {
		return !!this.value;
	}

	/**
	 * Provides the query string escaped in a way which is correct for combining into the URI representation.
	 * A leading '?' character will be included unless the Value is null or empty. Characters which are potentially
	 * dangerous are escaped.
	 * @returns The query string value
	 */
	toUriComponent(): string {
		// Escape things properly so System.Uri doesn't mis-interpret the data.
		return !!this.value ? this.value.replace('#', '%23') : '';
	}

	toString(): string {
		return this.toUriComponent();
	}
}
