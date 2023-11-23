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

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http.Abstractions/test/HostStringTest.cs#L50
test('Port_ExtractsPortFromValue', () => {
	function Port_ExtractsPortFromValue(
		sourceValue: string,
		expectedPort: number | undefined,
	): void {
		const hostString = new HostString(sourceValue);

		const result = hostString.port;

		expect(result).toBe(expectedPort);
	}

	Port_ExtractsPortFromValue('localhost', undefined);
	Port_ExtractsPortFromValue('1.2.3.4', undefined);
	Port_ExtractsPortFromValue('[2001:db8:a0b:12f0::1]', undefined);
	Port_ExtractsPortFromValue('本地主機', undefined);
	Port_ExtractsPortFromValue('localhost:5000', 5000);
	Port_ExtractsPortFromValue('1.2.3.4:5000', 5000);
	Port_ExtractsPortFromValue('[2001:db8:a0b:12f0::1]:5000', 5000);
	Port_ExtractsPortFromValue('本地主機:5000', 5000);
});

// TODO

// https://github.com/dotnet/aspnetcore/blob/ffa0a028464e13d46aaec0c5ad8de0725a4d5aa5/src/Http/Http.Abstractions/test/HostStringTest.cs#L82C17-L82C44
test('Ctor_CreatesFromHostAndPort', () => {
	function Ctor_CreatesFromHostAndPort(
		sourceHost: string,
		sourcePort: number,
		expectedHost: string,
		expectedPort: number,
	): void {
		const hostString = HostString.fromHostAndPort(sourceHost, sourcePort);

		const host = hostString.host;
		const port = hostString.port;

		expect(host).toBe(expectedHost);
		expect(port).toBe(expectedPort);
	}

	Ctor_CreatesFromHostAndPort('localhost', 5000, 'localhost', 5000);
	Ctor_CreatesFromHostAndPort('1.2.3.4', 5000, '1.2.3.4', 5000);
	Ctor_CreatesFromHostAndPort(
		'[2001:db8:a0b:12f0::1]',
		5000,
		'[2001:db8:a0b:12f0::1]',
		5000,
	);
	Ctor_CreatesFromHostAndPort(
		'2001:db8:a0b:12f0::1',
		5000,
		'[2001:db8:a0b:12f0::1]',
		5000,
	);
	Ctor_CreatesFromHostAndPort('本地主機', 5000, '本地主機', 5000);
});

// TODO
