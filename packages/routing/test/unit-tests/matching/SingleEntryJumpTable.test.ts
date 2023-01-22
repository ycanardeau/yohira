import { JumpTable, SingleEntryJumpTable } from '@yohira/routing';

import {
	SingleEntryJumpTableTestBase,
	testSingleEntryJumpTable,
} from './SingleEntryJumpTableTestBase';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/SingleEntryJumpTableTest.cs#L6
class SingleEntryJumpTableTest extends SingleEntryJumpTableTestBase {
	protected createJumpTable(
		defaultDestination: number,
		exitDestination: number,
		text: string,
		destination: number,
	): JumpTable {
		return new SingleEntryJumpTable(
			defaultDestination,
			exitDestination,
			text,
			destination,
		);
	}
}

testSingleEntryJumpTable(new SingleEntryJumpTableTest());
