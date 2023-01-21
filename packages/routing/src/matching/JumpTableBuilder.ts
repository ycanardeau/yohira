import { isAscii } from './Ascii';
import { DictionaryJumpTable } from './DictionaryJumpTable';
import { JumpTable } from './JumpTable';
import { SingleEntryAsciiJumpTable } from './SingleEntryAsciiJumpTable';
import { SingleEntryJumpTable } from './SingleEntryJumpTable';
import { ZeroEntryJumpTable } from './ZeroEntryJumpTable';

const invalidDestination = -1;

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/JumpTableBuilder.cs,3e54058e16386f0c,references
export function buildJumpTable(
	defaultDestination: number,
	exitDestination: number,
	pathEntries: { text: string; destination: number }[] | undefined,
): JumpTable {
	if (defaultDestination === invalidDestination) {
		const message =
			'defaultDestination is not set. Please report this as a bug.';
		throw new Error(message);
	}

	if (exitDestination === invalidDestination) {
		const message =
			'exitDestination is not set. Please report this as a bug.';
		throw new Error(message);
	}

	if (pathEntries === undefined || pathEntries.length === 0) {
		return new ZeroEntryJumpTable(defaultDestination, exitDestination);
	}

	if (pathEntries.length === 1 && isAscii(pathEntries[0].text)) {
		const entry = pathEntries[0];
		return new SingleEntryAsciiJumpTable(
			defaultDestination,
			exitDestination,
			entry.text,
			entry.destination,
		);
	}

	if (pathEntries.length === 1) {
		const entry = pathEntries[0];
		return new SingleEntryJumpTable(
			defaultDestination,
			exitDestination,
			entry.text,
			entry.destination,
		);
	}

	if (true /* TODO */) {
		return new DictionaryJumpTable(
			defaultDestination,
			exitDestination,
			pathEntries,
		);
	}

	// TODO
	throw new Error('Method not implemented.');
}
