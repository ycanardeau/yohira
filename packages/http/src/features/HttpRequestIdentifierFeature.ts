import { TimeSpan } from '@yohira/base';
import { IHttpRequestIdentifierFeature } from '@yohira/http.features';

// https://source.dot.net/#Microsoft.AspNetCore.Http/Features/HttpRequestIdentifierFeature.cs,676fc7cb376ba7ef,references
/**
 * Default implementation for {@link IHttpRequestIdentifierFeature}.
 */
export class HttpRequestIdentifierFeature
	implements IHttpRequestIdentifierFeature
{
	// Base32 encoding - in ascii sort order for easy text based sorting
	private static readonly encode32Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUV'
		.split('')
		.map((char) => char.charCodeAt(0));

	private static requestId =
		TimeSpan.fromTicks(621355968000000000n).ticks +
		TimeSpan.fromMilliseconds(new Date().getTime()).ticks;

	private id: string | undefined;

	private static generateRequestId(id: bigint): string {
		const encode32Chars = HttpRequestIdentifierFeature.encode32Chars;

		const buffer = Buffer.alloc(13);
		const value = id;
		buffer[12] = encode32Chars[Number(value & 31n)];
		buffer[11] = encode32Chars[Number((value >> 5n) & 31n)];
		buffer[10] = encode32Chars[Number((value >> 10n) & 31n)];
		buffer[9] = encode32Chars[Number((value >> 15n) & 31n)];
		buffer[8] = encode32Chars[Number((value >> 20n) & 31n)];
		buffer[7] = encode32Chars[Number((value >> 25n) & 31n)];
		buffer[6] = encode32Chars[Number((value >> 30n) & 31n)];
		buffer[5] = encode32Chars[Number((value >> 35n) & 31n)];
		buffer[4] = encode32Chars[Number((value >> 40n) & 31n)];
		buffer[3] = encode32Chars[Number((value >> 45n) & 31n)];
		buffer[2] = encode32Chars[Number((value >> 50n) & 31n)];
		buffer[1] = encode32Chars[Number((value >> 55n) & 31n)];
		buffer[0] = encode32Chars[Number((value >> 60n) & 31n)];
		return buffer.toString();
	}

	get traceIdentifier(): string {
		if (this.id === undefined) {
			this.id = HttpRequestIdentifierFeature.generateRequestId(
				++HttpRequestIdentifierFeature.requestId /* REVIEW: Interlocked.increment */,
			);
		}
		return this.id;
	}
	set traceIdentifier(value: string) {
		this.id = value;
	}
}
