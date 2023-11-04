import { HostString } from '@yohira/http.abstractions';
import { expect, test } from 'vitest';

// TODO

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http.Abstractions/test/HostStringTest.cs#L29
test('Domain_ExtractsHostFromValue', () => {
	function Domain_ExtractsHostFromValue(
		sourceValue: string,
		expectedDomain: string,
	): void {
		const hostString = new HostString(sourceValue);

		const result = hostString.host;

		expect(result).toBe(expectedDomain);
	}

	Domain_ExtractsHostFromValue('localhost', 'localhost');
	Domain_ExtractsHostFromValue('1.2.3.4', '1.2.3.4');
	Domain_ExtractsHostFromValue(
		'[2001:db8:a0b:12f0::1]',
		'[2001:db8:a0b:12f0::1]',
	);
	Domain_ExtractsHostFromValue('本地主機', '本地主機');
	Domain_ExtractsHostFromValue('localhost:5000', 'localhost');
	Domain_ExtractsHostFromValue('1.2.3.4:5000', '1.2.3.4');
	Domain_ExtractsHostFromValue(
		'[2001:db8:a0b:12f0::1]:5000',
		'[2001:db8:a0b:12f0::1]',
	);
	Domain_ExtractsHostFromValue('本地主機:5000', '本地主機');
});

// TODO
