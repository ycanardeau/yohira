import { Out } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { BaseHeaderParser } from './BaseHeaderParser';

type GetParsedValueLengthDelegate<T> = (
	value: StringSegment,
	startIndex: number,
	parsedValue: Out<T | undefined>,
) => number;

// https://source.dot.net/#Microsoft.Net.Http.Headers/GenericHeaderParser.cs,5dd0253eb7829217,references
export class GenericHeaderParser<T> extends BaseHeaderParser<T> {
	/** @internal */ constructor(
		supportsMultipleValues: boolean,
		private readonly _getParsedValueLength: GetParsedValueLengthDelegate<T>,
	) {
		super(supportsMultipleValues);
	}

	protected getParsedValueLength(
		value: StringSegment,
		startIndex: number,
		parsedValue: Out<T | undefined>,
	): number {
		return this._getParsedValueLength(value, startIndex, parsedValue);
	}
}
