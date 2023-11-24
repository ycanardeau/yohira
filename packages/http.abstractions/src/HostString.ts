import { includesAnyExcept } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';
import { domainToASCII } from 'node:url';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HostString.cs,677c1978743f8e43,references
export class HostString {
	private static readonly safeHostStringChars =
		'%-.0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZ[]abcdefghijklmnopqrstuvwxyz'.split(
			'',
		);

	constructor(readonly value: string) {}

	static fromHostAndPort(host: string, port: number): HostString {
		if (port <= 0) {
			throw new Error('The value must be greater than zero.' /* LOC */);
		}

		let index: number;
		if (
			!host.includes('[') &&
			(index = host.indexOf(':')) >= 0 &&
			index < host.length - 1 &&
			host.indexOf(':', index + 1) >= 0
		) {
			// IPv6 without brackets ::1 is the only type of host with 2 or more colons
			host = `[${host}]`;
		}

		return new HostString(`${host}:${port}`);
	}

	static fromUriComponent(uriComponent: string): HostString {
		if (!!uriComponent) {
			let index = 0;
			if (uriComponent.includes('[')) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (
				(index = uriComponent.indexOf(':')) >= 0 &&
				index < uriComponent.length - 1 &&
				uriComponent.indexOf(':', index + 1) >= 0
			) {
				// TODO
				throw new Error('Method not implemented.');
			} else if (uriComponent.includes('xn--')) {
				// TODO
				throw new Error('Method not implemented.');
			}
		}
		return new HostString(uriComponent);
	}

	get hasValue(): boolean {
		return !!this.value;
	}

	private static getParts(value: StringSegment): {
		host: StringSegment;
		port: StringSegment;
	} {
		let index = 0;
		let port = StringSegment.from(undefined);
		let host = StringSegment.from(undefined);

		if (StringSegment.isNullOrEmpty(value)) {
			return { host, port };
		} else if ((index = value.indexOf(']')) >= 0) {
			// IPv6 in brackets [::1], maybe with port
			host = value.subsegment(0, index + 1);
			// Is there a colon and at least one character?
			if (index + 2 < value.length && value.at(index + 1) === ':') {
				port = value.subsegment(index + 2);
			}
		} else if (
			(index = value.indexOf(':')) >= 0 &&
			index < value.length - 1 &&
			value.indexOf(':', index + 1) >= 0
		) {
			// IPv6 without brackets ::1 is the only type of host with 2 or more colons
			host = StringSegment.from(`[${value}]`);
			port = StringSegment.from(undefined);
		} else if (index >= 0) {
			// Has a port
			host = value.subsegment(0, index);
			port = value.subsegment(index + 1);
		} else {
			host = value;
			port = StringSegment.from(undefined);
		}

		return { host, port };
	}

	/**
	 * Returns the value of the host part of the value. The port is removed if it was present.
	 * IPv6 addresses will have brackets added if they are missing.
	 * @returns The host portion of the value.
	 */
	get host(): string {
		const { host } = HostString.getParts(StringSegment.from(this.value));

		return host.toString();
	}

	/**
	 * Returns the value of the port part of the host, or <value>null</value> if none is found.
	 * @returns The port portion of the value.
	 */
	get port(): number | undefined {
		const { port } = HostString.getParts(StringSegment.from(this.value));

		if (
			!StringSegment.isNullOrEmpty(port) &&
			Number.isInteger(Number(port.toString()))
		) {
			return Number(port.toString());
		}

		return undefined;
	}

	/**
	 * Compares the equality of the Value property, ignoring case.
	 * @param other The {@link HostString} to compare against.
	 * @returns <see langword="true" /> if they have the same value.
	 */
	equals(other: HostString): boolean {
		if (!this.hasValue && !other.hasValue) {
			return true;
		}
		return this.value.toLowerCase() === other.value.toLowerCase();
	}

	toUriComponent(): string {
		if (!this.hasValue) {
			return '';
		}

		if (!includesAnyExcept(this.value, HostString.safeHostStringChars)) {
			return this.value;
		}

		const { host, port } = HostString.getParts(
			StringSegment.from(this.value),
		);

		const encoded = domainToASCII(
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			host.buffer!.substring(host.offset, host.offset + host.length),
		);

		return StringSegment.isNullOrEmpty(port)
			? encoded
			: encoded.concat(':', port.toString());
	}

	toString(): string {
		return this.toUriComponent();
	}
}
