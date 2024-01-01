import { ITestSink } from './ITestSink';
import { WriteContext } from './WriteContext';

// https://source.dot.net/#Microsoft.AspNetCore.InternalTesting/Logging/TestSink.cs,7da53baaf5dd0dd0,references
export class TestSink implements ITestSink {
	writes: WriteContext[] = [];

	constructor(
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		public writeEnabled: (context: WriteContext) => boolean = undefined!,
	) {}

	write(context: WriteContext): void {
		if (this.writeEnabled === undefined || this.writeEnabled(context)) {
			this.writes.push(context);
		}
		// TODO: messageLogged
	}
}
