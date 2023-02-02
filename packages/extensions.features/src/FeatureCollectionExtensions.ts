import { IFeatureCollection } from './IFeatureCollection';

// https://source.dot.net/#Microsoft.Extensions.Features/FeatureCollectionExtensions.cs,feb00d82a0ec747f,references
export function getRequiredFeature<TFeature>(
	featureCollection: IFeatureCollection,
	featureType: symbol,
): TFeature {
	const feature = featureCollection.get<TFeature>(featureType);
	if (feature === undefined) {
		throw new Error(
			`Feature '${Symbol.keyFor(featureType)}' is not present.`,
		);
	}

	return feature;
}
