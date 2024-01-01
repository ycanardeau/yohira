import { WriteContext } from './WriteContext';

// https://source.dot.net/#Microsoft.AspNetCore.InternalTesting/Logging/ITestSink.cs,b1414fef32ffdc37,references
export interface ITestSink {
	writeEnabled: (context: WriteContext) => boolean;
	writes: WriteContext[] /* TODO: IProducerConsumerCollection<WriteContext> */;
	write(context: WriteContext): void;
}
