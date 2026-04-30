import { describe, expect, expectTypeOf, it } from "bun:test";
import { BigIntColumnBuilder } from "./bigint";

describe(BigIntColumnBuilder.name, () => {
	it("should preserve the builder name and default bigint config", () => {
		const builder = BigIntColumnBuilder("count");

		expect(builder.name).toBe("count");
		expect(!!builder._config.defaultVal).toBe(false);

		expectTypeOf<(typeof builder)["_state"]["type"]>().toEqualTypeOf<bigint>();
		expectTypeOf<
			(typeof builder)["_state"]["hasDefaultVal"]
		>().toEqualTypeOf<false>();
		expectTypeOf<
			(typeof builder)["_state"]["isGenerated"]
		>().toEqualTypeOf<false>();
	});

	it("should allow generated bigint columns", () => {
		const generatedBuilder = BigIntColumnBuilder("id").generated();

		expect(generatedBuilder.name).toBe("id");
		expect(generatedBuilder._config.isReadonly).toBe(true);
		expect(generatedBuilder._config.defaultVal).toBeFunction();
		expect(typeof generatedBuilder._config.defaultVal).toBe("function");

		expectTypeOf<
			(typeof generatedBuilder)["_state"]["type"]
		>().toEqualTypeOf<bigint>();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["isReadonly"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["hasDefaultVal"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof generatedBuilder)["_state"]["isGenerated"]
		>().toEqualTypeOf<true>();
	});

	it("should reject multiple generated calls on the same builder", () => {
		const builder = BigIntColumnBuilder("id").generated();

		expect(() => builder.generated()).toThrow();
	});
});
