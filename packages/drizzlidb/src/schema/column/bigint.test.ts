import { describe, expect, expectTypeOf, it } from "bun:test";
import { BigIntColumnBuilder } from "./bigint";

describe(BigIntColumnBuilder.name, () => {
	it("should preserve the builder name and default bigint config", () => {
		const builder = BigIntColumnBuilder("count");

		expect(builder.name).toBe("count");
		expect(!!builder._config.defaultVal).toBe(false);

		type builder = typeof builder._state;

		expectTypeOf<
			builder["insertType"] & builder["selectType"] & builder["updateType"]
		>().toEqualTypeOf<bigint>();
		expectTypeOf<builder["hasDefaultVal"]>().toEqualTypeOf<false>();
		expectTypeOf<builder["isGenerated"]>().toEqualTypeOf<false>();
	});

	it("should allow generated bigint columns", () => {
		const generatedBuilder = BigIntColumnBuilder("id").generated();

		expect(generatedBuilder.name).toBe("id");
		expect(generatedBuilder._config.isReadonly).toBe(true);
		expect(generatedBuilder._config.defaultVal).toBeFunction();

		type generatedBuilder = typeof generatedBuilder._state;

		expectTypeOf<
			generatedBuilder["insertType"] &
				generatedBuilder["selectType"] &
				generatedBuilder["updateType"]
		>().toEqualTypeOf<bigint>();
		expectTypeOf<generatedBuilder["isReadonly"]>().toEqualTypeOf<true>();
		expectTypeOf<generatedBuilder["hasDefaultVal"]>().toEqualTypeOf<true>();
		expectTypeOf<generatedBuilder["isGenerated"]>().toEqualTypeOf<true>();
	});

	it("should reject multiple generated calls on the same builder", () => {
		const builder = BigIntColumnBuilder("id").generated();

		expect(() => builder.generated()).toThrow();
	});
});
