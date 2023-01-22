import { JumpTable, PathSegment } from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L6
export abstract class MultipleEntryJumpTableTest {
	abstract createTable(
		defaultDestination: number,
		exitDestination: number,
		...entries: { text: string; destination: number }[]
	): JumpTable;

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L14
	GetDestination_ZeroLengthSegment_JumpsToExit(): void {
		const table = this.createTable(0, 1, { text: 'text', destination: 2 });

		const result = table.getDestination('ignored', new PathSegment(0, 0));

		expect(result).toBe(1);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L27
	GetDestination_NonMatchingSegment_JumpsToDefault(): void {
		const table = this.createTable(0, 1, { text: 'text', destination: 2 });

		const result = table.getDestination('text', new PathSegment(1, 2));

		expect(result).toBe(0);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L40
	GetDestination_SegmentMatchingText_JumpsToDestination(): void {
		const table = this.createTable(0, 1, { text: 'text', destination: 2 });

		const result = table.getDestination('some-text', new PathSegment(5, 4));

		expect(result).toBe(2);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L53
	GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination(): void {
		const table = this.createTable(0, 1, { text: 'text', destination: 2 });

		const result = table.getDestination('some-tExt', new PathSegment(5, 4));

		expect(result).toBe(2);
	}

	// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/MultipleEntryJumpTableTest.cs#L66
	GetDestination_SegmentMatchingTextIgnoreCase_MultipleEntries(): void {
		const table = this.createTable(
			0,
			1,
			{ text: 'tezt', destination: 2 },
			{ text: 'text', destination: 3 },
		);

		const result = table.getDestination('some-tExt', new PathSegment(5, 4));

		expect(result).toBe(3);
	}
}

export function testMultipleEntryJumpTable(
	multipleEntryJumpTableTest: MultipleEntryJumpTableTest,
): void {
	test('GetDestination_ZeroLengthSegment_JumpsToExit', () => {
		multipleEntryJumpTableTest.GetDestination_ZeroLengthSegment_JumpsToExit();
	});

	test('GetDestination_NonMatchingSegment_JumpsToDefault', () => {
		multipleEntryJumpTableTest.GetDestination_NonMatchingSegment_JumpsToDefault();
	});

	test('GetDestination_SegmentMatchingText_JumpsToDestination', () => {
		multipleEntryJumpTableTest.GetDestination_SegmentMatchingText_JumpsToDestination();
	});

	test('GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination', () => {
		multipleEntryJumpTableTest.GetDestination_SegmentMatchingTextIgnoreCase_JumpsToDestination();
	});

	test('GetDestination_SegmentMatchingTextIgnoreCase_MultipleEntries', () => {
		multipleEntryJumpTableTest.GetDestination_SegmentMatchingTextIgnoreCase_MultipleEntries();
	});
}
