export const ticksPerMicrosecond = 10;
export const ticksPerMillisecond = ticksPerMicrosecond * 1000;
export const ticksPerSecond = ticksPerMillisecond * 1000;
export const ticksPerMinute = ticksPerSecond * 60;
export const ticksPerHour = ticksPerMinute * 60;
export const ticksPerDay = ticksPerHour * 24;

export class TimeSpan {
	private constructor(readonly ticks: number) {}

	static fromTicks(value: number): TimeSpan {
		return new TimeSpan(value);
	}

	static fromDays(value: number): TimeSpan {
		return new TimeSpan(value * ticksPerDay);
	}

	static fromHours(value: number): TimeSpan {
		return new TimeSpan(value * ticksPerHour);
	}

	static fromMinutes(value: number): TimeSpan {
		return new TimeSpan(value * ticksPerMinute);
	}

	get totalMilliseconds(): number {
		return this.ticks / ticksPerMillisecond;
	}

	get totalSeconds(): number {
		return this.ticks / ticksPerSecond;
	}
}
