import { AuthenticationProperties } from '@yohira/authentication.abstractions';
import { BinaryReader, BinaryWriter, MemoryStream, using } from '@yohira/base';

import { IDataSerializer } from './IDataSerializer';

// https://source.dot.net/#Microsoft.AspNetCore.Authentication/PropertiesSerializer.cs,5b73ab8600787432,references
export class PropertiesSerializer
	implements IDataSerializer<AuthenticationProperties>
{
	private static readonly formatVersion = 1;

	static readonly default = new PropertiesSerializer();

	write(writer: BinaryWriter, properties: AuthenticationProperties): void {
		writer.writeInt32LE(PropertiesSerializer.formatVersion);
		writer.writeInt32LE(properties.items.size);

		for (const [key, value] of properties.items.entries()) {
			writer.writeString(key ?? '');
			writer.writeString(value ?? '');
		}
	}

	serialize(model: AuthenticationProperties): Buffer {
		return using(MemoryStream.alloc(), (memory) => {
			return using(new BinaryWriter(memory), (writer) => {
				this.write(writer, model);
				writer.flush();
				return memory.toBuffer();
			});
		});
	}

	read(reader: BinaryReader): AuthenticationProperties | undefined {
		if (reader.readInt32LE() !== PropertiesSerializer.formatVersion) {
			return undefined;
		}

		const count = reader.readInt32LE();
		const extra = new Map<string, string | undefined>();

		for (let index = 0; index !== count; ++index) {
			const key = reader.readString();
			const value = reader.readString();
			extra.set(key, value);
		}
		return new AuthenticationProperties(extra, undefined);
	}

	deserialize(data: Buffer): AuthenticationProperties | undefined {
		return using(MemoryStream.from(data, 0, data.length), (memory) => {
			return using(new BinaryReader(memory), (reader) => {
				return this.read(reader);
			});
		});
	}
}
