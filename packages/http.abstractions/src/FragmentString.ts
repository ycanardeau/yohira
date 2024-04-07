// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/FragmentString.cs,668908078cec3c93,references
/**
 * Provides correct handling for FragmentString value when needed to generate a URI string
 */
export class FragmentString {
	/**
	 * Represents the empty fragment string. This field is read-only.
	 */
	static empty(): FragmentString {
		return new FragmentString('');
	}

	constructor(readonly value?: string) {
		if (!!value && value[0] !== '#') {
			throw new Error(
				"The leading '#' must be included for a non-empty fragment.",
			);
		}
	}

	/**
	 * True if the fragment string is not empty
	 */
	get hasValue(): boolean {
		return !!this.value;
	}

	/**
	 * Provides the fragment string escaped in a way which is correct for combining into the URI representation.
	 * A leading '#' character will be included unless the Value is null or empty. Characters which are potentially
	 * dangerous are escaped.
	 * @returns The fragment string value
	 */
	toUriComponent(): string {
		// Escape things properly so System.Uri doesn't mis-interpret the data.
		return !!this.value ? this.value : '';
	}

	toString(): string {
		return this.toUriComponent();
	}
}
