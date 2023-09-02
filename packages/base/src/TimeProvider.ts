// https://source.dot.net/#System.Private.CoreLib/src/libraries/Common/src/System/TimeProvider.cs,a19aa63c27b6bb68,references
/**
 * Provides an abstraction for time.
 */
export abstract class TimeProvider {
	protected constructor() {}

	getUtcNow(): number /* REVIEW */ {
		return new Date().getTime();
	}
}

class SystemTimeProvider extends TimeProvider {
	constructor() {
		super();
	}
}

export const systemTimeProvider = new SystemTimeProvider();
