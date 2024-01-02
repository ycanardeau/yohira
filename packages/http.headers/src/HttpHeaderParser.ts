import { Out, Ref } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

// https://source.dot.net/#Microsoft.Net.Http.Headers/HttpHeaderParser.cs,1750c5e6f866e711,references
export abstract class HttpHeaderParser<T> {
	protected constructor(readonly supportsMultipleValues: boolean) {}

	abstract tryParseValue(
		value: StringSegment,
		index: Ref<number>,
		parsedValue: Out<T | undefined>,
	): boolean;

	parseValue(value: StringSegment, index: Ref<number>): T | undefined {
		// Index may be value.Length (e.g. both 0). This may be allowed for some headers (e.g. Accept but not
		// allowed by others (e.g. Content-Length). The parser has to decide if this is valid or not.
		if (
			!(
				value === undefined ||
				(index.get() >= 0 && index.get() <= value.length)
			)
		) {
			throw new Error('Assertion failed.');
		}

		// If a parser returns 'undefined', it means there was no value, but that's valid (e.g. "Accept: "). The caller
		// can ignore the value.
		let result: T | undefined;
		if (
			!this.tryParseValue(value, index, {
				set: (value) => (result = value),
			})
		) {
			throw new Error(
				`The header contains invalid values at index ${index.get()}: '${
					value.value ?? '<undefined>'
				}'`,
			);
		}
		return result;
	}
}
