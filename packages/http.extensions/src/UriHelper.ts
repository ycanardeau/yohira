import {
	FragmentString,
	HostString,
	PathString,
	QueryString,
} from '@yohira/http.abstractions';

const schemeDelimiter = '://';

function initializeAbsoluteUriString(
	buffer: Buffer,
	uriParts: {
		scheme: string;
		host: string;
		pathBase: string;
		path: string;
		query: string;
		fragment: string;
	},
): void {
	let index = 0;

	let pathBaseSpan = uriParts.pathBase;

	if (
		uriParts.path.length > 0 &&
		pathBaseSpan.length > 0 &&
		pathBaseSpan.slice(-1) === '/'
	) {
		// If the path string has a trailing slash and the other string has a leading slash, we need
		// to trim one of them.
		// Trim the last slahs from pathBase. The total length was decremented before the call to string.Create.
		pathBaseSpan = pathBaseSpan.slice(0, -1);
	}

	index += buffer.write(uriParts.scheme, index);
	index += buffer.write(schemeDelimiter, index);
	index += buffer.write(uriParts.host, index);
	index += buffer.write(pathBaseSpan, index);
	index += buffer.write(uriParts.path, index);
	index += buffer.write(uriParts.query, index);
	buffer.write(uriParts.fragment, index);
}

// https://source.dot.net/#Microsoft.AspNetCore.Http.Extensions/UriHelper.cs,9e720c6adb1cc8ee,references
export function buildAbsolute(
	scheme: string,
	host: HostString,
	pathBase = new PathString(),
	path = new PathString(),
	query = new QueryString(),
	fragment = new FragmentString(),
): string {
	const hostText = host.toUriComponent();
	const pathBaseText = pathBase.toUriComponent();
	let pathText = path.toUriComponent();
	const queryText = query.toUriComponent();
	const fragmentText = fragment.toUriComponent();

	let length =
		scheme.length +
		schemeDelimiter.length +
		hostText.length +
		pathBaseText.length +
		pathText.length +
		queryText.length +
		fragmentText.length;

	if (!pathText) {
		if (!pathBaseText) {
			pathText = '/';
			length++;
		}
	} else if (pathBaseText.endsWith('/')) {
		// If the path string has a trailing slash and the other string has a leading slash, we need
		// to trim one of them.
		// Just decrement the total length, for now.
		length--;
	}

	return ((): string => {
		const buffer = Buffer.alloc(length);
		initializeAbsoluteUriString(buffer, {
			scheme: scheme,
			host: hostText,
			pathBase: pathBaseText,
			path: pathText,
			query: queryText,
			fragment: fragmentText,
		});
		return buffer.toString();
	})();
}
