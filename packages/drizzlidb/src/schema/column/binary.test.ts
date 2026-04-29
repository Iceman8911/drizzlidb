import { describe, expectTypeOf, it } from "bun:test";
import { BinaryColumnBuilder } from "./binary";

describe(BinaryColumnBuilder.name, () => {
	it("should set types", () => {
		const blobBuilder = BinaryColumnBuilder().type("blob");
		type BlobBuilderState = (typeof blobBuilder)["_state"];
		expectTypeOf<BlobBuilderState["dbType"]>().toEqualTypeOf<Blob>;
		expectTypeOf<BlobBuilderState["type"]>().toEqualTypeOf<Blob>;

		const bufferBuilder = BinaryColumnBuilder<string, ArrayBuffer>();
		type BufferBuilderState = (typeof bufferBuilder)["_state"];
		expectTypeOf<BufferBuilderState["dbType"]>().toEqualTypeOf<ArrayBuffer>;
		expectTypeOf<BufferBuilderState["type"]>().toEqualTypeOf<ArrayBuffer>;
	});
});
