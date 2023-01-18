import { List } from '@yohira/base';
import { Endpoint } from '@yohira/http.abstractions';

// https://source.dot.net/#Microsoft.AspNetCore.Routing/Matching/DfaNode.cs,5c5c602ca1bcd885,references
export class DfaNode {
	// The depth of the node. The depth indicates the number of segments
	// that must be processed to arrive at this node.
	//
	// This value is not computed for Policy nodes and will be set to -1.
	pathDepth = -1;

	// Just for diagnostics and debugging
	label?: string;

	matches?: List<Endpoint>;

	literals?: Map<string, DfaNode>;

	parameters?: DfaNode;

	catchAll?: DfaNode;

	policyEdges?: Map<number /* TODO */, DfaNode>;

	visit(visitor: (node: DfaNode) => void): void {
		if (this.literals !== undefined) {
			for (const [, value] of this.literals) {
				value.visit(visitor);
			}
		}

		if (this.parameters !== undefined && this !== this.parameters) {
			this.parameters.visit(visitor);
		}

		if (this.catchAll !== undefined && this !== this.catchAll) {
			this.catchAll.visit(visitor);
		}

		if (this.policyEdges !== undefined) {
			for (const [, value] of this.policyEdges) {
				value.visit(visitor);
			}
		}

		visitor(this);
	}

	debuggerToString(): string {
		const formatNode = (other: DfaNode): string => {
			return this === other ? 'this' : other.debuggerToString();
		};

		const builder: string[] = [];
		builder.push(
			this.label ?? '',
			' d:',
			this.pathDepth.toString(),
			' m:',
			(this.matches?.count ?? 0).toString(),
			' c: ',
			this.literals !== undefined
				? Array.from(this.literals.entries())
						.map(([key, value]) => `${key}->(${formatNode(value)})`)
						.join(', ')
				: '',
		);
		return builder.join('');
	}
}
