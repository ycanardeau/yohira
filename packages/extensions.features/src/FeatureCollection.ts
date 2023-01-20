import { Type, tryGetValue } from '@yohira/base';
import { Result } from '@yohira/third-party.ts-results';

import { IFeatureCollection } from './IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureCollection.cs,6445f4078512cfd6,references
export class FeatureCollection implements IFeatureCollection {
	private readonly defaults?: IFeatureCollection;
	private features?: Map<
		string /* TODO: Replace with Type. See tc39/proposal-record-tuple. */,
		any /* TODO: DO not use any. */
	>;
	private /* REVIEW: volatile */ containerRevision = 0;

	get revision(): number {
		return this.containerRevision + (this.defaults?.revision ?? 0);
	}

	get<T>(key: Type): T | undefined {
		let tryGetValueResult: Result<T, undefined>;
		return this.features !== undefined &&
			(tryGetValueResult = tryGetValue(this.features, key.value)) &&
			tryGetValueResult.ok
			? tryGetValueResult.val
			: this.defaults?.get(key);
	}

	set<T>(key: Type, instance: T | undefined): void {
		if (instance === undefined) {
			if (this.features !== undefined && this.features.has(key.value)) {
				this.features.delete(key.value);
				this.containerRevision++;
			}
			return;
		}

		if (this.features === undefined) {
			this.features = new Map();
		}
		this.features.set(key.value, instance);
		this.containerRevision++;
	}
}
