import { PathSegment, ZeroEntryJumpTable } from '@yohira/routing';
import { expect, test } from 'vitest';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/ZeroEntryJumpTableTest.cs#L9
test('GetDestination_ZeroLengthSegment_JumpsToExit', () => {
	const table = new ZeroEntryJumpTable(0, 1);

	const result = table.getDestination('ignored', new PathSegment(0, 0));

	expect(result).toBe(1);
});

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/ZeroEntryJumpTableTest.cs#L22
test('GetDestination_SegmentWithLength_JumpsToDefault', () => {
	const table = new ZeroEntryJumpTable(0, 1);

	const result = table.getDestination('ignored', new PathSegment(0, 1));

	expect(result).toBe(0);
});
