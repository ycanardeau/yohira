import { JumpTable, PathSegment } from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTestBase.cs#L6
export abstract class SingleEntryJumpTableTestBase {
	protected abstract createJumpTable(
		defaultDestination: number,
		exitDestination: number,
		text: string,
		destination: number,
	): JumpTable;

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTestBase.cs#L15
	GetDestination_ZeroLengthSegment_JumpsToExit(): void {
		const table = this.createJumpTable(0, 1, 'text', 2);

		const result = table.getDestination('ignored', new PathSegment(0, 0));

		expect(result).toBe(1);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTestBase.cs#L28
	GetDestination_NonMatchingSegment_JumpsToDefault(): void {
		const table = this.createJumpTable(0, 1, 'text', 2);

		const result = table.getDestination('text', new PathSegment(1, 2));

		expect(result).toBe(0);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTestBase.cs#L41
	GetDestination_SegmentMatchingText_JumpsToDestination(): void {
		const table = this.createJumpTable(0, 1, 'text', 2);

		const result = table.getDestination('some-text', new PathSegment(5, 4));

		expect(result).toBe(2);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTestBase.cs#L54
	GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination(): void {
		const table = this.createJumpTable(0, 1, 'text', 2);

		const result = table.getDestination('some-tExt', new PathSegment(5, 4));

		expect(result).toBe(2);
	}
}

export function testSingleEntryJumpTable(
	singleEntryJumpTableTest: SingleEntryJumpTableTestBase,
): void {
	test('GetDestination_ZeroLengthSegment_JumpsToExit', () => {
		singleEntryJumpTableTest.GetDestination_ZeroLengthSegment_JumpsToExit();
	});

	test('GetDestination_NonMatchingSegment_JumpsToDefault', () => {
		singleEntryJumpTableTest.GetDestination_NonMatchingSegment_JumpsToDefault();
	});

	test('GetDestination_SegmentMatchingText_JumpsToDestination', () => {
		singleEntryJumpTableTest.GetDestination_SegmentMatchingText_JumpsToDestination();
	});

	test('GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination', () => {
		singleEntryJumpTableTest.GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination();
	});
}
