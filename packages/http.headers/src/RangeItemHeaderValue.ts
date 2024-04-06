// https://source.dot.net/#Microsoft.Net.Http.Headers/RangeItemHeaderValue.cs,02762be3526503e6,references
export class RangeItemHeaderValue {
	constructor(
		/**
		 * Gets the position at which to start sending data.
		 */
		readonly from: number | undefined,
		/**
		 * Gets the position at which to stop sending data.
		 */
		readonly to: number | undefined,
	) {}
}
