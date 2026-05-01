import { describe, expect, expectTypeOf, it } from "bun:test";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";
import { StringColumnBuilder } from "./string";

describe(StringColumnBuilder.name, () => {
	it("should have `.enum()` should narrow type and add validator", () => {
		const strBuilder = StringColumnBuilder().primary().enum(["a", "b"]);
		type strBuilder = PrivateBaseColumnBuilderProps.GetState<typeof strBuilder>;

		expect(
			strBuilder[PrivateBaseColumnBuilderProps.Config].validator?.[0],
		).toBeFunction();
		expectTypeOf<strBuilder["insertType"]>().toEqualTypeOf<"a" | "b">();
		expectTypeOf<strBuilder["selectType"]>().toEqualTypeOf<"a" | "b">();
		expectTypeOf<strBuilder["updateType"]>().toEqualTypeOf<"a" | "b">();
	});

	it("should allow generated string columns and preserve generated state", () => {
		const generatedBuilder = StringColumnBuilder("id").generated();

		expect(generatedBuilder.name).toBe("id");
		expect(
			generatedBuilder[PrivateBaseColumnBuilderProps.Config].isReadonly,
		).toBe(true);
		expect(
			generatedBuilder[PrivateBaseColumnBuilderProps.Config].defaultVal,
		).toBeFunction();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof generatedBuilder
			>["isGenerated"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof generatedBuilder
			>["hasDefaultVal"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof generatedBuilder
			>["isReadonly"]
		>().toEqualTypeOf<true>();
	});

	it("should type-level reject generated after a default value", () => {
		expect(() => {
			const GeneratedAfterDefault = StringColumnBuilder("id")
				.default("x")
				.generated();

			expectTypeOf<typeof GeneratedAfterDefault>().not.toBeObject();
		}).toThrow();
	});
});
