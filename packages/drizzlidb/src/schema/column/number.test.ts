import { describe, expect, expectTypeOf, it } from "bun:test";
import { NumberColumnBuilder } from "./number";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(NumberColumnBuilder.name, () => {
	it("should preserve the builder name and default number config", () => {
		const namedBuilder = NumberColumnBuilder("count");

		expect(namedBuilder.name).toBe("count");
		expect(
			!!namedBuilder[PrivateBaseColumnBuilderProps.Config].isAutoIncrementing,
		).toBe(false);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof namedBuilder
			>["insertType"] &
				PrivateBaseColumnBuilderProps.GetState<
					typeof namedBuilder
				>["selectType"] &
				PrivateBaseColumnBuilderProps.GetState<
					typeof namedBuilder
				>["updateType"]
		>().toEqualTypeOf<number>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof namedBuilder
			>["isAutoIncrementing"]
		>().toEqualTypeOf<false>();
	});

	it("should allow primary keys to auto increment", () => {
		const autoIncrementBuilder = NumberColumnBuilder("id")
			.primary("id_primary_idx")
			.autoIncrement();

		expect(
			autoIncrementBuilder[PrivateBaseColumnBuilderProps.Config].isPrimaryKey,
		).toBe(true);
		expect(
			autoIncrementBuilder[PrivateBaseColumnBuilderProps.Config]
				.isAutoIncrementing,
		).toBe(true);
		expect(
			!!autoIncrementBuilder[PrivateBaseColumnBuilderProps.Config].isNullable,
		).toBe(false);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof autoIncrementBuilder
			>["isPrimaryKey"]
		>().toEqualTypeOf<true>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof autoIncrementBuilder
			>["isAutoIncrementing"]
		>().toEqualTypeOf<true>();
	});

	it("should allow generated number columns and preserve generated state", () => {
		const generatedBuilder = NumberColumnBuilder("id").generated();

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

		expect(first[PrivateBaseColumnBuilderProps.Config].isAutoIncrementing).toBe(
			true,
		);
		expect(() => first.autoIncrement()).toThrow();
	});
});
