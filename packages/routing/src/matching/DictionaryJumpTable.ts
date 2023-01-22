import { CaseInsensitiveMap, tryGetValue } from '@yohira/base';

import { JumpTable } from './JumpTable';
import { PathSegment } from './PathSegment';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DictionaryJumpTable.cs,dd50050c822a7c48,references
export class DictionaryJumpTable extends JumpTable {
	private readonly map: CaseInsensitiveMap<number>;

	constructor(
		private readonly defaultDestination: number,
		private readonly exitDestination: number,
		entries: { text: string; destination: number }[],
	) {
		super();

		this.map = new CaseInsensitiveMap();
		for (const entry of entries) {
			this.map.set(entry.text, entry.destination);
		}
	}

	getDestination(path: string, segment: PathSegment): number {
		if (segment.length === 0) {
			return this.exitDestination;
		}

		const text = path.substring(
			segment.start,
			segment.start + segment.length,
		);
		const tryGetValueResult = tryGetValue(this.map, text);
		if (tryGetValueResult.ok) {
			return tryGetValueResult.val;
		}

		return this.defaultDestination;
	}

	debuggerToString(): string {
		const builder: string[] = [];
		builder.push('{ ');

		builder.push(
			Array.from(this.map.entries())
				.map(([key, value]) => `${key}: ${value}`)
				.join(', '),
		);

		builder.push('$+: ', this.defaultDestination.toString(), ', ');

		builder.push('$0: ', this.defaultDestination.toString());

		builder.push(' }');

		return builder.join('');
	}
}
