import { describe, expectTypeOf, it } from "bun:test";
import { BinaryColumnBuilder } from "./binary";
import type { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(BinaryColumnBuilder.name, () => {
	it("should set types", () => {
		const blobBuilder = BinaryColumnBuilder().type("blob");
		type BlobBuilderState = PrivateBaseColumnBuilderProps.GetState<
			typeof blobBuilder
		>;
		expectTypeOf<
			BlobBuilderState["selectType"] &
				BlobBuilderState["insertType"] &
				BlobBuilderState["updateType"]
		>().toEqualTypeOf<Blob>;

		const bufferBuilder = BinaryColumnBuilder<string, ArrayBuffer>();
		type BufferBuilderState = PrivateBaseColumnBuilderProps.GetState<
			typeof bufferBuilder
		>;
		expectTypeOf<
			BufferBuilderState["insertType"] &
				BufferBuilderState["selectType"] &
				BufferBuilderState["updateType"]
		>().toEqualTypeOf<ArrayBuffer>;
	});
});
