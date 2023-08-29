// https://source.dot.net/#System.Private.CoreLib/src/libraries/Common/src/System/TimeProvider.cs,a19aa63c27b6bb68,references
/**
 * Provides an abstraction for time.
 */
export abstract class TimeProvider {
	protected TimeProvider() {}
}

class SystemTimeProvider extends TimeProvider {
	constructor() {
		super();
	}
}

export const systemTimeProvider = new SystemTimeProvider();
