import { describe, expect, expectTypeOf, it } from "bun:test";
import { NumberColumnBuilder } from "./number";

describe(NumberColumnBuilder.name, () => {
	it("should preserve the builder name and default number config", () => {
		const namedBuilder = NumberColumnBuilder("count");

		expect(namedBuilder.name).toBe("count");
		expect(!!namedBuilder._config.isAutoIncrementing).toBe(false);
		expectTypeOf<
			(typeof namedBuilder)["_state"]["type"]
		>().toEqualTypeOf<number>();
		expectTypeOf<
			(typeof namedBuilder)["_state"]["isAutoIncrementing"]
		>().toEqualTypeOf<false>();
	});

	it("should allow primary keys to auto increment", () => {
		const autoIncrementBuilder = NumberColumnBuilder("id")
			.primary("id_primary_idx")
			.autoIncrement();

		expect(autoIncrementBuilder._config.isPrimaryKey).toBe(true);
		expect(autoIncrementBuilder._config.isAutoIncrementing).toBe(true);
		expect(!!autoIncrementBuilder._config.isNullable).toBe(false);
		expectTypeOf<
			(typeof autoIncrementBuilder)["_state"]["isPrimaryKey"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof autoIncrementBuilder)["_state"]["isAutoIncrementing"]
		>().toEqualTypeOf<true>();
	});

	it("should allow generated number columns and preserve generated state", () => {
		const generatedBuilder = NumberColumnBuilder("id").generated();

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
		const GeneratedAfterDefault = NumberColumnBuilder("id")
			.default(1)
			.generated();

		expectTypeOf<typeof GeneratedAfterDefault>().not.toEqualTypeOf();
	});

	it("should reject autoIncrement for non-primary number columns", () => {
		const builder = NumberColumnBuilder("score");

		expect(() => builder.autoIncrement()).toThrow();
	});

	it("should reject multiple autoIncrement calls on the same builder", () => {
		const builder = NumberColumnBuilder("order").primary();

		const first = builder.autoIncrement();

		expect(first._config.isAutoIncrementing).toBe(true);
		expect(() => first.autoIncrement()).toThrow();
	});
});
