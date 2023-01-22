import { JumpTable } from './JumpTable';
import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/SingleEntryJumpTable.cs,93f31d9eb150568f,references
export class SingleEntryJumpTable extends JumpTable {
	constructor(
		private readonly defaultDestination: number,
		private readonly exitDestination: number,
		private readonly text: string,
		private readonly destination: number,
	) {
		super();
	}

	getDestination(path: string, segment: PathSegment): number {
		if (segment.length === 0) {
			return this.exitDestination;
		}

		if (
			segment.length === this.text.length &&
			path
				.substring(segment.start, segment.start + segment.length)
				.toLowerCase() ===
				this.text
					.substring(0, segment.length)
					.toLowerCase() /* OPTIMIZE */
		) {
			return this.destination;
		}

		return this.defaultDestination;
	}

	debuggerToString(): string {
		return `{{ ${this.text}: ${this.destination}, $+: ${this.defaultDestination}, $0: ${this.exitDestination} }}`;
	}
}
