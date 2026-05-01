import { describe, expect, expectTypeOf, it } from "bun:test";
import { ArrayColumnBuilder } from "./array";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(ArrayColumnBuilder.name, () => {
	it("should update types upon init with generics", () => {
		const arr1 = ArrayColumnBuilder<string, string>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["insertType"]
		>().toEqualTypeOf<string[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["selectType"]
		>().toEqualTypeOf<string[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["updateType"]
		>().toEqualTypeOf<string[]>();

		const arr2 = ArrayColumnBuilder<string, string | number | Date | bigint>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["insertType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["selectType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["updateType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();
	});

	it("should update types with `.of()`", () => {
		const arr1 = ArrayColumnBuilder().of(String);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["insertType"]
		>().toEqualTypeOf<string[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["selectType"]
		>().toEqualTypeOf<string[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr1>["updateType"]
		>().toEqualTypeOf<string[]>();

		const arr2 = ArrayColumnBuilder().of(Number, Boolean);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["insertType"]
		>().toEqualTypeOf<(number | boolean)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["selectType"]
		>().toEqualTypeOf<(number | boolean)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr2>["updateType"]
		>().toEqualTypeOf<(number | boolean)[]>();

		const arr3 = ArrayColumnBuilder().of(Date, BigInt, Number, String);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr3>["insertType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr3>["selectType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr3>["updateType"]
		>().toEqualTypeOf<(string | number | Date | bigint)[]>();

		const arr4 = ArrayColumnBuilder().of(Boolean, BigInt, Number, String, Date);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr4>["insertType"]
		>().toEqualTypeOf<(string | number | boolean | bigint | Date)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr4>["insertType"]
		>().toEqualTypeOf<(string | number | boolean | bigint | Date)[]>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof arr4>["updateType"]
		>().toEqualTypeOf<(string | number | boolean | bigint | Date)[]>();
	});

	it("should update types and config with `.multiEntry()`", () => {
		const arr1 = ArrayColumnBuilder().multiEntry();
		expect(arr1[PrivateBaseColumnBuilderProps.Config].isMultiEntryIndex).toBe(
			true,
		);
	});

	it("should be incompatible with the combination of `.unique()` and `.multiEntry()`", () => {
		expect(() => {
			const arr1 = ArrayColumnBuilder().unique().multiEntry();
			expectTypeOf(arr1).toBeString();
			expectTypeOf(arr1).not.toBeObject();
		}).toThrow();

		expect(() => {
			const arr2 = ArrayColumnBuilder().multiEntry().unique();
			expectTypeOf(arr2).toBeString();
			expectTypeOf(arr2).not.toBeObject();
		}).toThrow();
	});

	it("should not allow `.multiEntry()` to be called twice", () => {
		const arr = ArrayColumnBuilder().multiEntry();

		expectTypeOf<ReturnType<(typeof arr)["multiEntry"]>>().toBeString();
		expect(() => arr.multiEntry()).toThrow();
	});

	it("should not allow `.unique()` to be called twice", () => {
		const arr = ArrayColumnBuilder().unique("duplicate_idx");

		expectTypeOf<ReturnType<(typeof arr)["unique"]>>().toBeString();
		expect(() => arr.unique("duplicate_idx")).toThrow();
	});
});
