import { IFeatureCollection } from './IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureReferences.cs,f92cfeae16318a36,references
export class FeatureReferences<TCache> {
	collection!: IFeatureCollection;

	initialize(collection: IFeatureCollection): void {
		this.collection = collection;
	}
}
