import { Type } from '@yohira/base/Type';
import { IFeatureCollection } from '@yohira/extensions.features/IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureCollection.cs,6445f4078512cfd6,references
export class FeatureCollection implements IFeatureCollection {
	private readonly features = new Map<
		string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
		any
	>();

	get = <T>(key: Type): T | undefined => {
		return this.features.get(key.value);
	};

	set = <T>(key: Type, instance: T | undefined): void => {
		this.features.set(key.value, instance);
	};
}
