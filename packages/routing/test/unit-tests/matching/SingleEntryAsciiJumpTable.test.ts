import { JumpTable, SingleEntryAsciiJumpTable } from '@yohira/routing';

import {
	SingleEntryJumpTableTestBase,
	testSingleEntryJumpTable,
} from './SingleEntryJumpTableTestBase';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryAsciiJumpTableTest.cs#L6
class SingleEntryAsciiJumpTableTest extends SingleEntryJumpTableTestBase {
	protected createJumpTable(
		defaultDestination: number,
		exitDestination: number,
		text: string,
		destination: number,
	): JumpTable {
		return new SingleEntryAsciiJumpTable(
			defaultDestination,
			exitDestination,
			text,
			destination,
		);
	}
}

testSingleEntryJumpTable(new SingleEntryAsciiJumpTableTest());
