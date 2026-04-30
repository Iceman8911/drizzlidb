import { describe, expectTypeOf, it } from "bun:test";
import { BinaryColumnBuilder } from "./binary";

describe(BinaryColumnBuilder.name, () => {
	it("should set types", () => {
		const blobBuilder = BinaryColumnBuilder().type("blob");
		type BlobBuilderState = (typeof blobBuilder)["_state"];
		expectTypeOf<
			BlobBuilderState["selectType"] &
				BlobBuilderState["insertType"] &
				BlobBuilderState["updateType"]
		>().toEqualTypeOf<Blob>;

		const bufferBuilder = BinaryColumnBuilder<string, ArrayBuffer>();
		type BufferBuilderState = (typeof bufferBuilder)["_state"];
		expectTypeOf<
			BufferBuilderState["insertType"] &
				BufferBuilderState["selectType"] &
				BufferBuilderState["updateType"]
		>().toEqualTypeOf<ArrayBuffer>;
	});
});
