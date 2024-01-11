import { EnvCallbackContext } from './EnvCallbackContext';
import { IResourceAnnotation } from './IResourceAnnotation';

// https://github.com/dotnet/aspire/blob/e3fc7cc96166078b27ba9e63558761ef265a2fcd/src/Aspire.Hosting/ApplicationModel/EnvironmentCallbackAnnotation.cs#L9
/**
 * Represents an annotation that provides a callback to modify the environment variables of an application.
 */
export class EnvCallbackAnnotation implements IResourceAnnotation {
	private constructor(
		private _callback: (context: EnvCallbackContext) => void,
	) {}

	static fromNameAndCallback(
		name: string,
		callback: () => string,
	): EnvCallbackAnnotation {
		return new EnvCallbackAnnotation((c) => {
			const context = callback();
			c.envVariables.set(name, context);
			return context;
		});
	}

	get callback(): (context: EnvCallbackContext) => void {
		return this._callback;
	}
	private set callback(value: (context: EnvCallbackContext) => void) {
		this._callback = value;
	}
}
