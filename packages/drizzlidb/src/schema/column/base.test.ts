import { describe, expect, expectTypeOf, it } from "bun:test";
import type { Satisfies } from "../../shared/types";
import {
	BaseColumnBuilder,
	type BaseColumnGenerics,
	type DefaultBaseColumnGenerics,
} from "./base";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(BaseColumnBuilder.name, () => {
	/** Since `BaseColumnBuilder` is abstract, we extend it with a dummy wrapper. */
	class TestColumnBuilder<
		const TName extends string,
		const TGenerics extends BaseColumnGenerics = DefaultBaseColumnGenerics,
	> extends BaseColumnBuilder<TName, TGenerics> {}

	type StringColumnGenerics = Satisfies<
		{
			insertType: string;
			updateType: string;
			selectType: string;
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
		type builder = PrivateBaseColumnBuilderProps.GetState<typeof builder>;

		expectTypeOf<builder["insertType"]>().toBeString();
		expectTypeOf<builder["selectType"]>().toBeString();
		expectTypeOf<builder["updateType"]>().toBeString();

		const brandedBuilder = builder.brand("testBrand");
		type brandedBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof brandedBuilder
		>;

		expectTypeOf<
			brandedBuilder["insertType"]["__brand"]
		>().toEqualTypeOf<"testBrand">();
		expectTypeOf<
			brandedBuilder["selectType"]["__brand"]
		>().toEqualTypeOf<"testBrand">();
		expectTypeOf<
			brandedBuilder["updateType"]["__brand"]
		>().toEqualTypeOf<"testBrand">();
	});

	it("should store a computation callback typewise and during runtime", () => {
		const builderWithComputation = new TestColumnBuilder().computed(
			() => "" as never,
			() => "foo",
		);
		type builderWithComputation = PrivateBaseColumnBuilderProps.GetState<
			typeof builderWithComputation
		>;

		expect(
			builderWithComputation[PrivateBaseColumnBuilderProps.Config].computation,
		).not.toBeUndefined();
		expectTypeOf<builderWithComputation["isComputed"]>().toEqualTypeOf<true>();
	});

	it("should apply default configuration and preserve type-level state", () => {
		const defaultBuilder = new TestColumnBuilder<"col", StringColumnGenerics>(
			"col",
		).default("hello");
		const defaultBuilderConfig =
			defaultBuilder[PrivateBaseColumnBuilderProps.Config];
		type defaultBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof defaultBuilder
		>;

		expect(defaultBuilderConfig.defaultVal).toBe("hello");
		expect(defaultBuilderConfig.isNullable).toBe(false);
		expectTypeOf<defaultBuilder["hasDefaultVal"]>().toEqualTypeOf<true>();
		expectTypeOf<defaultBuilder["isNullable"]>().toEqualTypeOf<false>();
	});

	it("should create indexed and unique index configuration", () => {
		const indexBuilder = new TestColumnBuilder<"name", StringColumnGenerics>(
			"name",
		).index("name_idx");

		const uniqueBuilder = new TestColumnBuilder<"email", StringColumnGenerics>(
			"email",
		).unique("email_unique_idx");

		expect(indexBuilder[PrivateBaseColumnBuilderProps.Config].indexName).toBe(
			"name_idx",
		);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof indexBuilder>["isIndex"]
		>().toEqualTypeOf<true>();

		const uniqueBuilderConfig =
			uniqueBuilder[PrivateBaseColumnBuilderProps.Config];

		expect(uniqueBuilderConfig.indexName).toBe("email_unique_idx");
		expect(uniqueBuilderConfig.isUniqueIndex).toBe(true);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof uniqueBuilder
			>["isUniqueIndex"]
		>().toEqualTypeOf<true>();
	});

	it("should configure primary key columns correctly", () => {
		const primaryBuilder = new TestColumnBuilder<"id", StringColumnGenerics>(
			"id",
		).primary("id_primary_idx");

		const primaryBuilderConfig =
			primaryBuilder[PrivateBaseColumnBuilderProps.Config];

		type primaryBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof primaryBuilder
		>;

		expect(primaryBuilderConfig.indexName).toBe("id_primary_idx");
		expect(primaryBuilderConfig.isPrimaryKey).toBe(true);
		expect(primaryBuilderConfig.isUniqueIndex).toBe(true);
		expect(primaryBuilderConfig.isNullable).toBe(false);
		expectTypeOf<primaryBuilder["isPrimaryKey"]>().toEqualTypeOf<true>();
		expectTypeOf<primaryBuilder["isIndex"]>().toEqualTypeOf<true>();
	});

	it("should apply readonly and update configuration correctly", () => {
		const readonlyBuilder = new TestColumnBuilder<
			"readonly",
			StringColumnGenerics
		>("readonly").readonly();
		const readonlyBuilderConfig =
			readonlyBuilder[PrivateBaseColumnBuilderProps.Config];

		expect(readonlyBuilderConfig.isReadonly).toBe(true);
		expect(readonlyBuilderConfig.updater).toBeUndefined();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof readonlyBuilder
			>["hasUpdateVal"]
		>().toEqualTypeOf<false>();

		const updateBuilder = new TestColumnBuilder<
			"updated",
			StringColumnGenerics
		>("updated").update(() => "next");
		type updateBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof updateBuilder
		>;

		expect(
			updateBuilder[PrivateBaseColumnBuilderProps.Config].updater,
		).toBeInstanceOf(Function);
		expectTypeOf<updateBuilder["hasUpdateVal"]>().toEqualTypeOf<true>();
		expectTypeOf<updateBuilder["isNullable"]>().toEqualTypeOf<false>();
	});

	it("should configure validation callbacks", () => {
		const validatedBuilder = new TestColumnBuilder<
			"validated",
			StringColumnGenerics
		>("validated").validate((val) => val.length > 0);

		expect(
			validatedBuilder[PrivateBaseColumnBuilderProps.Config].validator?.[0],
		).toBeInstanceOf(Function);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof validatedBuilder
			>["insertType"]
		>().toEqualTypeOf<string>();
	});

	it("should not allow repeat chaining for repeated builder calls", () => {
		const computedBuilder = new TestColumnBuilder().computed(
			() => "",
			(tbl) => tbl,
		);

		expectTypeOf<
			ReturnType<(typeof computedBuilder)["computed"]>
		>().toBeString();
		expect(() =>
			computedBuilder.computed(
				() => "",
				(tbl) => tbl,
			),
		).toThrow();

		const defaultBuilder = new TestColumnBuilder<"col", StringColumnGenerics>(
			"col",
		).default("hello");

		expectTypeOf<ReturnType<(typeof defaultBuilder)["default"]>>().toBeString();
		expect(() => defaultBuilder.default("hello")).toThrow();

		const nullableBuilder = new TestColumnBuilder<
			"nullable",
			StringColumnGenerics
		>("nullable").nullable();

		expectTypeOf<
			ReturnType<(typeof nullableBuilder)["nullable"]>
		>().toBeString();
		expect(() => nullableBuilder.nullable()).toThrow();

		const primaryBuilder = new TestColumnBuilder<"id", StringColumnGenerics>(
			"id",
		).primary("id_primary_idx");

		expectTypeOf<ReturnType<(typeof primaryBuilder)["primary"]>>().toBeString();
		expect(() => primaryBuilder.primary("id_primary_idx")).toThrow();

		const readonlyBuilder = new TestColumnBuilder<
			"readonly",
			StringColumnGenerics
		>("readonly").readonly();

		expectTypeOf<
			ReturnType<(typeof readonlyBuilder)["readonly"]>
		>().toBeString();
		expect(() => readonlyBuilder.readonly()).toThrow();

		const updateBuilder = new TestColumnBuilder<
			"updated",
			StringColumnGenerics
		>("updated").update(() => "next");

		expectTypeOf<ReturnType<(typeof updateBuilder)["update"]>>().toBeString();
		expect(() => updateBuilder.update(() => "next")).toThrow();

		const uniqueBuilder = new TestColumnBuilder<"email", StringColumnGenerics>(
			"email",
		).unique("email_unique_idx");

		expectTypeOf<ReturnType<(typeof uniqueBuilder)["unique"]>>().toBeString();
		expect(() => uniqueBuilder.unique("email_unique_idx")).toThrow();
	});
});
