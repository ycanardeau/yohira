export interface IDisposable {
	dispose(): void;
}

export function using<T extends IDisposable>(
	disposable: T,
	action: (disposable: T) => void,
): void {
	try {
		action(disposable);
	} finally {
		disposable.dispose();
	}
}
