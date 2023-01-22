import { JumpTable } from './JumpTable';
import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/ZeroEntryJumpTable.cs,9dddc7f6b563ce58,references
export class ZeroEntryJumpTable extends JumpTable {
	constructor(
		private readonly defaultDestination: number,
		private readonly exitDestination: number,
	) {
		super();
	}

	getDestination(path: string, segment: PathSegment): number {
		return segment.length === 0
			? this.exitDestination
			: this.defaultDestination;
	}

	debuggerToString(): string {
		return `{{ $+: ${this.defaultDestination}, $0: ${this.exitDestination} }}`;
	}
}
