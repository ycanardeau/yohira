// REVIEW
// https://source.dot.net/#Microsoft.Net.Http.Headers/HeaderUtilities.cs,dadd0f25ec4d2ffd,references
/**
 * Converts the 64-bit numeric value to its equivalent string representation.
 * @param value The number to convert.
 * @returns The string representation of the value of this instance, consisting of a sequence of digits ranging from 0 to 9 with no leading zeroes.
 * In case of negative numeric value it will have a leading minus sign.
 */
export function formatInt64(value: number): string {
	switch (value) {
		case 0:
			return '0';
		case 1:
			return '1';
		case -1:
			return '-1';
		default:
			return value.toString();
	}
}
