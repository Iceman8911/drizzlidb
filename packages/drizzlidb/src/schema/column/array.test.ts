import { describe, expect, expectTypeOf, it } from "bun:test";
import { ArrayColumnBuilder } from "./array";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(ArrayColumnBuilder.name, () => {
	it("should update types upon init with generics", () => {
		const arr1 = ArrayColumnBuilder<string, string>();
		type arr1 = PrivateBaseColumnBuilderProps.GetState<typeof arr1>;
		expectTypeOf<arr1["insertType"]>().toEqualTypeOf<string[]>();
		expectTypeOf<arr1["selectType"]>().toEqualTypeOf<string[]>();
		expectTypeOf<arr1["updateType"]>().toEqualTypeOf<string[]>();

		type arr2Type = string | number | Date | bigint;
		const arr2 = ArrayColumnBuilder<string, arr2Type>();
		type arr2 = PrivateBaseColumnBuilderProps.GetState<typeof arr2>;
		expectTypeOf<arr2["insertType"]>().toEqualTypeOf<arr2Type[]>();
		expectTypeOf<arr2["selectType"]>().toEqualTypeOf<arr2Type[]>();
		expectTypeOf<arr2["updateType"]>().toEqualTypeOf<arr2Type[]>();
	});

	it("should update types with `.of()`", () => {
		const arr1 = ArrayColumnBuilder().of(String);
		type arr1 = PrivateBaseColumnBuilderProps.GetState<typeof arr1>;
		expectTypeOf<arr1["insertType"]>().toEqualTypeOf<string[]>();
		expectTypeOf<arr1["selectType"]>().toEqualTypeOf<string[]>();
		expectTypeOf<arr1["updateType"]>().toEqualTypeOf<string[]>();

		const arr2 = ArrayColumnBuilder().of(Number, Boolean);
		type arr2 = PrivateBaseColumnBuilderProps.GetState<typeof arr2>;
		type arr2Types = (number | boolean)[];
		expectTypeOf<arr2["insertType"]>().toEqualTypeOf<arr2Types>();
		expectTypeOf<arr2["selectType"]>().toEqualTypeOf<arr2Types>();
		expectTypeOf<arr2["updateType"]>().toEqualTypeOf<arr2Types>();

		const arr3 = ArrayColumnBuilder().of(Date, BigInt, Number, String);
		type arr3 = PrivateBaseColumnBuilderProps.GetState<typeof arr3>;
		type arr3Types = (string | number | Date | bigint)[];
		expectTypeOf<arr3["insertType"]>().toEqualTypeOf<arr3Types>();
		expectTypeOf<arr3["selectType"]>().toEqualTypeOf<arr3Types>();
		expectTypeOf<arr3["updateType"]>().toEqualTypeOf<arr3Types>();

		const arr4 = ArrayColumnBuilder().of(Boolean, BigInt, Number, String, Date);
		type arr4 = PrivateBaseColumnBuilderProps.GetState<typeof arr4>;
		type arr4Types = (string | number | boolean | bigint | Date)[];
		expectTypeOf<arr4["insertType"]>().toEqualTypeOf<arr4Types>();
		expectTypeOf<arr4["selectType"]>().toEqualTypeOf<arr4Types>();
		expectTypeOf<arr4["updateType"]>().toEqualTypeOf<arr4Types>();
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
