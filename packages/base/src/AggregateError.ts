export class AggregateError extends Error {
	constructor(readonly errors: Iterable<any>, readonly message = '') {
		super(message);

		this.errors = Array.from(errors);
	}
}
