import {
	FragmentString,
	HostString,
	PathString,
	QueryString,
} from '@yohira/http.abstractions';
import { buildAbsolute } from '@yohira/http.extensions';
import { expect, test } from 'vitest';

// TODO

// https://github.com/dotnet/aspnetcore/blob/9de56a105c77b98e867ffdd1213b9e1f83edda67/src/Http/Http.Extensions/test/UriHelperTests.cs#L26
test('EncodeEmptyFullUrl', () => {
	const result = buildAbsolute('http', new HostString(''));

	expect(result).toBe('http:///');
});

// https://github.com/dotnet/aspnetcore/blob/9de56a105c77b98e867ffdd1213b9e1f83edda67/src/Http/Http.Extensions/test/UriHelperTests.cs#L34
test('EncodeFullUrl', () => {
	const result = buildAbsolute(
		'http',
		new HostString('my.HoΨst:80'),
		new PathString('/un?escaped/base'),
		new PathString('/un?escaped'),
		new QueryString('?name=val%23ue'),
		new FragmentString('#my%20value'),
	);

	expect(result).toBe(
		'http://my.xn--host-cpd:80/un%3Fescaped/base/un%3Fescaped?name=val%23ue#my%20value',
	);
});

// https://github.com/dotnet/aspnetcore/blob/9de56a105c77b98e867ffdd1213b9e1f83edda67/src/Http/Http.Extensions/test/UriHelperTests.cs#L63C17-L63C46
test('BuildAbsoluteGenerationChecks', () => {
	function BuildAbsoluteGenerationChecks(
		scheme: string,
		host: string,
		pathBase: string,
		path: string,
		query: string,
		fragment: string,
		expectedUri: string,
	): void {
		const uri = buildAbsolute(
			scheme,
			new HostString(host),
			new PathString(pathBase),
			new PathString(path),
			new QueryString(query),
			new FragmentString(fragment),
		);

		expect(uri).toBe(expectedUri);
	}

	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'',
		'',
		'',
		'http://example.com/',
	);
	BuildAbsoluteGenerationChecks(
		'https',
		'example.com',
		'',
		'',
		'',
		'',
		'https://example.com/',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/foo/bar',
		'',
		'',
		'http://example.com/foo/bar',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/foo/bar',
		'?baz=1',
		'',
		'http://example.com/foo/bar?baz=1',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/foo',
		'',
		'#col=2',
		'http://example.com/foo#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/foo',
		'?bar=1',
		'#col=2',
		'http://example.com/foo?bar=1#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'/base',
		'/foo',
		'?bar=1',
		'#col=2',
		'http://example.com/base/foo?bar=1#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'/base/',
		'/foo',
		'?bar=1',
		'#col=2',
		'http://example.com/base/foo?bar=1#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'/base/',
		'',
		'?bar=1',
		'#col=2',
		'http://example.com/base/?bar=1#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'',
		'?bar=1',
		'#col=2',
		'http://example.com/?bar=1#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'',
		'',
		'#frag?stillfrag/stillfrag',
		'http://example.com/#frag?stillfrag/stillfrag',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'',
		'?q/stillq',
		'#frag?stillfrag/stillfrag',
		'http://example.com/?q/stillq#frag?stillfrag/stillfrag',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/fo#o',
		'',
		'#col=2',
		'http://example.com/fo%23o#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'/fo?o',
		'',
		'#col=2',
		'http://example.com/fo%3Fo#col=2',
	);
	BuildAbsoluteGenerationChecks(
		'ftp',
		'example.com',
		'',
		'/',
		'',
		'',
		'ftp://example.com/',
	);
	BuildAbsoluteGenerationChecks(
		'ftp',
		'example.com',
		'/',
		'/',
		'',
		'',
		'ftp://example.com/',
	);
	BuildAbsoluteGenerationChecks(
		'https',
		'127.0.0.0:80',
		'',
		'/bar',
		'',
		'',
		'https://127.0.0.0:80/bar',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'[1080:0:0:0:8:800:200C:417A]',
		'',
		'/index.html',
		'',
		'',
		'http://[1080:0:0:0:8:800:200C:417A]/index.html',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'',
		'///',
		'',
		'',
		'http://example.com///',
	);
	BuildAbsoluteGenerationChecks(
		'http',
		'example.com',
		'///',
		'///',
		'',
		'',
		'http://example.com/////',
	);
});

// TODO
