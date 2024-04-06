import { Out } from '@yohira/base';
import { StringSegment } from '@yohira/extensions.primitives';

import { getWhitespaceLength } from './HttpRuleParser';

// https://source.dot.net/#Microsoft.Net.Http.Headers/HeaderUtilities.cs,58a1e50e462ee84f,references
export function areEqualCollections<T extends { equals(other: T): boolean }>(
	x: T[] | undefined,
	y: T[] | undefined,
	comparer?: { equals(x: T, y: T): boolean } | undefined,
): boolean {
	if (x === undefined) {
		return y === undefined || y.length === 0;
	}

	if (y === undefined) {
		return x.length === 0;
	}

	if (x.length !== y.length) {
		return false;
	}

	if (x.length === 0) {
		return true;
	}

	// We have two unordered lists. So comparison is an O(n*m) operation which is expensive. Usually
	// headers have 1-2 parameters (if any), so this comparison shouldn't be too expensive.
	const alreadyFound: boolean[] = new Array(x.length);
	let i = 0;
	for (const xItem of x) {
		/* TODO: if (xItem === undefined) {
			throw new Error('Assertion failed.');
		} */

		i = 0;
		let found = false;
		for (const yItem of y) {
			if (!alreadyFound[i]) {
				if (
					(comparer === undefined && xItem.equals(yItem)) ||
					(comparer !== undefined && comparer.equals(xItem, yItem))
				) {
					alreadyFound[i] = true;
					found = true;
					break;
				}
			}
			i++;
		}

		if (!found) {
			return false;
		}
	}

	// Since we never re-use a "found" value in 'y', we expected 'alreadyFound' to have all fields set to 'true'.
	// Otherwise the two collections can't be equal and we should not get here.
	// TODO: assert

	return true;
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/HeaderUtilities.cs,731734fbab671b9b,references
export function getNextNonEmptyOrWhitespaceIndex(
	input: StringSegment,
	startIndex: number,
	skipEmptyValues: boolean,
	separatorFound: Out<boolean>,
): number {
	if (startIndex > input.length) {
		// it's OK if index == value.Length.
		throw new Error('Assertion failed.');
	}

	separatorFound.set(false);
	let current = startIndex + getWhitespaceLength(input, startIndex);

	if (current === input.length || input.at(current) !== ',') {
		return current;
	}

	// If we have a separator, skip the separator and all following whitespaces. If we support
	// empty values, continue until the current character is neither a separator nor a whitespace.
	separatorFound.set(true);
	current++; // skip delimiter.
	current = current + getWhitespaceLength(input, current);

	if (skipEmptyValues) {
		while (current < input.length && input.at(current) === ',') {
			current++; // skip delimiter.
			current = current + getWhitespaceLength(input, current);
		}
	}

	return current;
}

// https://source.dot.net/#Microsoft.Net.Http.Headers/HeaderUtilities.cs,8cc345898aa19d3e,references
export function tryParseNonNegativeInt32(
	value: StringSegment,
	result: Out<number>,
): boolean {
	if (!value.buffer || value.length === 0) {
		result.set(0);
		return false;
	}

	const valueAsNumber = Number(value.toString());
	if (Number.isInteger(valueAsNumber)) {
		result.set(valueAsNumber);
		return true;
	} else {
		return false;
	}
}

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

// https://source.dot.net/#Microsoft.Net.Http.Headers/HeaderUtilities.cs,0d2ef77ed3c8f120,references
export function throwIfReadOnly(isReadOnly: boolean): void {
	if (isReadOnly) {
		throw new Error(
			'The object cannot be modified because it is read-only.',
		);
	}
}
