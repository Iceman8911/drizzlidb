import { describe, expect, expectTypeOf, it } from "bun:test";
import type { Satisfies } from "../../shared/types";
import { BaseColumnBuilder, type BaseColumnGenerics } from "./base";

describe(BaseColumnBuilder.name, () => {
	/** Since `BaseColumnBuilder` is abstract, we extend it with a dummy wrapper. */
	class TestColumnBuilder<
		const TName extends string,
		const TGenerics extends BaseColumnGenerics,
	> extends BaseColumnBuilder<TName, TGenerics> {}

	type StringColumnGenerics = Satisfies<
		{
			type: string;
			dbType: string;
			isNullable: false;
			hasDefaultVal: false;
			hasUpdateVal: false;
			isUniqueIndex: false;
			isIndex: false;
			indexName: string;
			isMultiEntryIndex: false;
			isPrimaryKey: false;
			isComputed: false;
			isReadonly: false;
		},
		BaseColumnGenerics
	>;

	it("should preserve the name on its type and during runtime", () => {
		const namedBuilderName = "namedBuilder";
		const namedBuilder = new TestColumnBuilder(namedBuilderName);

		expect(namedBuilder.name).toBe(namedBuilderName);
		expectTypeOf(namedBuilderName).toEqualTypeOf(namedBuilderName);
	});

	it("should properly brand its type", () => {
		const builder = new TestColumnBuilder<"toBrand", StringColumnGenerics>(
			"toBrand",
		);

		expectTypeOf<typeof builder._state.type>().toBeString();

		const brandedBuilder = builder.brand("testBrand");

		expectTypeOf<
			typeof brandedBuilder._state.type.__brand
		>().toEqualTypeOf<"testBrand">();
	});

	it("should store a computation callback typewise and during runtime", () => {
		const builderWithComputation = new TestColumnBuilder().computed(
			() => "" as never,
			() => "foo",
		);

		expect(builderWithComputation._config.computation).not.toBeUndefined();
		expectTypeOf<
			(typeof builderWithComputation)["_state"]["isComputed"]
		>().toEqualTypeOf<true>();
	});

	it("should apply default configuration and preserve type-level state", () => {
		const defaultBuilder = new TestColumnBuilder<"col", StringColumnGenerics>(
			"col",
		).default("hello");

		expect(defaultBuilder._config.defaultVal).toBe("hello");
		expect(defaultBuilder._config.isNullable).toBe(false);
		expectTypeOf<
			(typeof defaultBuilder)["_state"]["hasDefaultVal"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof defaultBuilder)["_state"]["isNullable"]
		>().toEqualTypeOf<false>();
	});

	it("should create indexed and unique index configuration", () => {
		const indexBuilder = new TestColumnBuilder<"name", StringColumnGenerics>(
			"name",
		).index("name_idx");

		const uniqueBuilder = new TestColumnBuilder<"email", StringColumnGenerics>(
			"email",
		).unique("email_unique_idx");

		expect(indexBuilder._config.indexName).toBe("name_idx");
		expectTypeOf<
			(typeof indexBuilder)["_state"]["isIndex"]
		>().toEqualTypeOf<true>();

		expect(uniqueBuilder._config.indexName).toBe("email_unique_idx");
		expect(uniqueBuilder._config.isUniqueIndex).toBe(true);
		expectTypeOf<
			(typeof uniqueBuilder)["_state"]["isUniqueIndex"]
		>().toEqualTypeOf<true>();
	});

	it("should configure primary key columns correctly", () => {
		const primaryBuilder = new TestColumnBuilder<"id", StringColumnGenerics>(
			"id",
		).primary("id_primary_idx");

		expect(primaryBuilder._config.indexName).toBe("id_primary_idx");
		expect(primaryBuilder._config.isPrimaryKey).toBe(true);
		expect(primaryBuilder._config.isUniqueIndex).toBe(true);
		expect(primaryBuilder._config.isNullable).toBe(false);
		expectTypeOf<
			(typeof primaryBuilder)["_state"]["isPrimaryKey"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof primaryBuilder)["_state"]["isIndex"]
		>().toEqualTypeOf<true>();
	});

	it("should apply readonly and update configuration correctly", () => {
		const readonlyBuilder = new TestColumnBuilder<
			"readonly",
			StringColumnGenerics
		>("readonly").readonly();

		expect(readonlyBuilder._config.isReadonly).toBe(true);
		expect(readonlyBuilder._config.updater).toBeUndefined();
		expectTypeOf<
			(typeof readonlyBuilder)["_state"]["hasUpdateVal"]
		>().toEqualTypeOf<false>();

		const updateBuilder = new TestColumnBuilder<
			"updated",
			StringColumnGenerics
		>("updated").update(() => "next");

		expect(updateBuilder._config.updater).toBeInstanceOf(Function);
		expectTypeOf<
			(typeof updateBuilder)["_state"]["hasUpdateVal"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			(typeof updateBuilder)["_state"]["isNullable"]
		>().toEqualTypeOf<false>();
	});

	it("should configure validation callbacks", () => {
		const validatedBuilder = new TestColumnBuilder<
			"validated",
			StringColumnGenerics
		>("validated").validate((val) => val.length > 0);

		expect(validatedBuilder._config.validator?.[0]).toBeInstanceOf(Function);
		expectTypeOf<
			(typeof validatedBuilder)["_state"]["type"]
		>().toEqualTypeOf<string>();
	});
});
