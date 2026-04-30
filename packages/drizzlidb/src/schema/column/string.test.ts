import { describe, expect, expectTypeOf, it } from "bun:test";
import { StringColumnBuilder } from "./string";

describe(StringColumnBuilder.name, () => {
	it("should have `.enum()` should narrow type and add validator", () => {
		const b = StringColumnBuilder().enum(["a", "b"]);

		expect(b._config.validator?.[0]).toBeFunction();
		expectTypeOf<(typeof b)["_state"]["insertType"]>().toEqualTypeOf<
			"a" | "b"
		>();
		expectTypeOf<(typeof b)["_state"]["selectType"]>().toEqualTypeOf<
			"a" | "b"
		>();
		expectTypeOf<(typeof b)["_state"]["updateType"]>().toEqualTypeOf<
			"a" | "b"
		>();
	});

	it("should allow generated string columns and preserve generated state", () => {
		const generatedBuilder = StringColumnBuilder("id").generated();

		expect(generatedBuilder.name).toBe("id");
		expect(generatedBuilder._config.isReadonly).toBe(true);
		expect(generatedBuilder._config.defaultVal).toBeFunction();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["isGenerated"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["hasDefaultVal"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["isReadonly"]
		>().toEqualTypeOf<true>();
	});

	it("should type-level reject generated after a default value", () => {
		const GeneratedAfterDefault = StringColumnBuilder("id")
			.default("x")
			.generated();

		expectTypeOf<typeof GeneratedAfterDefault>().not.toBeObject();
	});
});
