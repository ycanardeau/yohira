export interface IEquatable<T> {
	equals(other: T | undefined): boolean;
}
