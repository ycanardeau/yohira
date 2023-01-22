import { DictionaryJumpTable, JumpTable } from '@yohira/routing';

import {
	MultipleEntryJumpTableTest,
	testMultipleEntryJumpTable,
} from './MultipleEntryJumpTableTest';

// https://github.com/dotnet/aspnetcore/blob/fdf79c0855e45fed987df0965cd08ce3882931d3/src/Http/Routing/test/UnitTests/Matching/DictionaryJumpTableTest.cs#L6
class DictionaryJumpTableTest extends MultipleEntryJumpTableTest {
	createTable(
		defaultDestination: number,
		exitDestination: number,
		...entries: { text: string; destination: number }[]
	): JumpTable {
		return new DictionaryJumpTable(
			defaultDestination,
			exitDestination,
			entries,
		);
	}
}

testMultipleEntryJumpTable(new DictionaryJumpTableTest());
