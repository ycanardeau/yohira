import { tryGetValue } from '@yohira/base';
import { Result } from '@yohira/third-party.ts-results';

import { IFeatureCollection } from './IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureCollection.cs,6445f4078512cfd6,references
export class FeatureCollection implements IFeatureCollection {
	private readonly defaults: IFeatureCollection | undefined;
	private features: Map<symbol, any /* TODO: Do not use any. */> | undefined;
	private /* REVIEW: volatile */ containerRevision = 0;

	get revision(): number {
		return this.containerRevision + (this.defaults?.revision ?? 0);
	}

	get<T>(key: symbol): T | undefined {
		let tryGetValueResult: Result<T, undefined>;
		return this.features !== undefined &&
			(tryGetValueResult = tryGetValue(this.features, key)) &&
			tryGetValueResult.ok
			? tryGetValueResult.val
			: this.defaults?.get(key);
	}

	set<T>(key: symbol, instance: T | undefined): void {
		if (instance === undefined) {
			if (this.features !== undefined && this.features.has(key)) {
				this.features.delete(key);
				this.containerRevision++;
			}
			return;
		}

		if (this.features === undefined) {
			this.features = new Map();
		}
		this.features.set(key, instance);
		this.containerRevision++;
	}

	*[Symbol.iterator](): Iterator<[symbol, any /* TODO: Do not use any. */]> {
		if (this.features !== undefined) {
			for (const pair of this.features) {
				yield pair;
			}
		}

		if (this.defaults !== undefined) {
			// TODO
			throw new Error('Method not implemented.');
		}
	}
}
