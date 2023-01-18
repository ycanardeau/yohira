import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/JumpTable.cs,5f4c220c3996ed5d,references
export abstract class JumpTable {
	abstract getDestination(path: string, segment: PathSegment): number;

	debuggerToString(): string {
		return `${this.constructor.name}`;
	}
}
