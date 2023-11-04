import { StringSegment } from '@yohira/extensions.primitives';

// https://source.dot.net/#Microsoft.AspNetCore.Http.Abstractions/HostString.cs,677c1978743f8e43,references
export class HostString {
	constructor(readonly value: string) {}

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
		return !this.value;
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

	get host(): string {
		const { host } = HostString.getParts(StringSegment.from(this.value));

		return host.toString();
	}

	toUriComponent(): string {
		// TODO
		throw new Error('Method not implemented.');
	}
}
