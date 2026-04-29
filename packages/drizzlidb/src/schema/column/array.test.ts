import { describe, expect, expectTypeOf, it } from "bun:test";
import { ArrayColumnBuilder } from "./array";

describe(ArrayColumnBuilder.name, () => {
	it("should update types upon init with generics", () => {
		const arr1 = ArrayColumnBuilder<string, string>();
		expectTypeOf<(typeof arr1)["_state"]["type"]>().toEqualTypeOf<string[]>();
		expectTypeOf<(typeof arr1)["_state"]["dbType"]>().toEqualTypeOf<string[]>();

		const arr2 = ArrayColumnBuilder<string, string | number | Date | bigint>();
		expectTypeOf<(typeof arr2)["_state"]["type"]>().toEqualTypeOf<
			(string | number | Date | bigint)[]
		>();
		expectTypeOf<(typeof arr2)["_state"]["dbType"]>().toEqualTypeOf<
			(string | number | Date | bigint)[]
		>();
	});

	it("should update types with `.of()`", () => {
		const arr1 = ArrayColumnBuilder().of(String);
		expectTypeOf<(typeof arr1)["_state"]["type"]>().toEqualTypeOf<string[]>();
		expectTypeOf<(typeof arr1)["_state"]["dbType"]>().toEqualTypeOf<string[]>();

		const arr2 = ArrayColumnBuilder().of(Number, Boolean);
		expectTypeOf<(typeof arr2)["_state"]["type"]>().toEqualTypeOf<
			(number | boolean)[]
		>();
		expectTypeOf<(typeof arr2)["_state"]["dbType"]>().toEqualTypeOf<
			(number | boolean)[]
		>();

		const arr3 = ArrayColumnBuilder().of(Date, BigInt, Number, String);
		expectTypeOf<(typeof arr3)["_state"]["type"]>().toEqualTypeOf<
			(string | number | Date | bigint)[]
		>();
		expectTypeOf<(typeof arr3)["_state"]["dbType"]>().toEqualTypeOf<
			(string | number | Date | bigint)[]
		>();

		const arr4 = ArrayColumnBuilder().of(Boolean, BigInt, Number, String, Date);
		expectTypeOf<(typeof arr4)["_state"]["type"]>().toEqualTypeOf<
			(string | number | boolean | bigint | Date)[]
		>();
		expectTypeOf<(typeof arr4)["_state"]["dbType"]>().toEqualTypeOf<
			(string | number | boolean | bigint | Date)[]
		>();
	});

	it("should update types and config with `.multiEntry()`", () => {
		const arr1 = ArrayColumnBuilder().multiEntry();
		expect(arr1._config.isMultiEntryIndex).toBe(true);
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
});
