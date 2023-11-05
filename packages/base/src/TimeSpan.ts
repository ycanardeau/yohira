export const ticksPerMicrosecond = 10n;
export const ticksPerMillisecond = ticksPerMicrosecond * 1000n;
export const ticksPerSecond = ticksPerMillisecond * 1000n;
export const ticksPerMinute = ticksPerSecond * 60n;
export const ticksPerHour = ticksPerMinute * 60n;
export const ticksPerDay = ticksPerHour * 24n;

// https://source.dot.net/#System.Private.CoreLib/src/libraries/System.Private.CoreLib/src/System/TimeSpan.cs,865ef7b89f41b632
export class TimeSpan {
	private constructor(readonly ticks: bigint) {}

	static fromTicks(value: bigint): TimeSpan {
		return new TimeSpan(value);
	}

	static fromDays(value: number): TimeSpan {
		return new TimeSpan(BigInt(value) * ticksPerDay);
	}

	static fromHours(value: number): TimeSpan {
		return new TimeSpan(BigInt(value) * ticksPerHour);
	}

	static fromMinutes(value: number): TimeSpan {
		return new TimeSpan(BigInt(value) * ticksPerMinute);
	}

	static fromMilliseconds(value: number): TimeSpan {
		return new TimeSpan(BigInt(value) * ticksPerMillisecond);
	}

	get totalMilliseconds(): number {
		return Number(this.ticks / ticksPerMillisecond);
	}

	get totalSeconds(): number {
		return Number(this.ticks / ticksPerSecond);
	}
}
