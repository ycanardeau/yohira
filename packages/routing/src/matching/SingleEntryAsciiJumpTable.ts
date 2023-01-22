import { asciiIgnoreCaseEquals } from './Ascii';
import { JumpTable } from './JumpTable';
import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/SingleEntryAsciiJumpTable.cs,0952d90bf7fb340b,references
export class SingleEntryAsciiJumpTable extends JumpTable {
	constructor(
		private readonly defaultDestination: number,
		private readonly exitDestination: number,
		private readonly text: string,
		private readonly destination: number,
	) {
		super();
	}

	getDestination(path: string, segment: PathSegment): number {
		const length = segment.length;
		if (length === 0) {
			return this.exitDestination;
		}

		const text = this.text;
		if (length !== text.length) {
			return this.defaultDestination;
		}

		const a = path.substring(segment.start, segment.start + length);
		const b = text;

		return asciiIgnoreCaseEquals(a, b, length)
			? this.destination
			: this.defaultDestination;
	}

	debuggerToString(): string {
		return `{{ ${this.text}: ${this.destination}, $+: ${this.defaultDestination}, $0: ${this.exitDestination} }}`;
	}
}
