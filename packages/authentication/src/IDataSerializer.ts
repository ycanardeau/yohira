// https://source.dot.net/#Microsoft.AspNetCore.Authentication/IDataSerializer.cs,f067f31be837f862,references
/**
 * Contract for serialzing authentication data.
 */
export interface IDataSerializer<TModel> {
	/**
	 * Serializes the specified {@link model}.
	 * @param model The value to serialize.
	 * @returns The serialized data.
	 */
	serialize(model: TModel): Buffer;

	/**
	 * Deserializes the specified {@link data} as an instance of type {@link TModel}.
	 * @param data The bytes being deserialized.
	 * @returns The model.
	 */
	deserialize(data: Buffer): TModel | undefined;
}
