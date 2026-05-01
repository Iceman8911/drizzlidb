import { describe, expect, expectTypeOf, it } from "bun:test";
import { DateColumnBuilder } from "./date";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(DateColumnBuilder.name, () => {
	it("should support `.defaultNow()`", () => {
		const d1 = DateColumnBuilder("created").defaultNow();
		expect(d1[PrivateBaseColumnBuilderProps.Config].defaultVal).toBeFunction();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof d1>["selectType"]
		>().toEqualTypeOf<Date>();
	});

	it("should support `.updateNow()`", () => {
		const d2 = DateColumnBuilder("updated").updateNow();
		expect(d2[PrivateBaseColumnBuilderProps.Config].updater).toBeFunction();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof d2>["selectType"]
		>().toEqualTypeOf<Date>();
	});
});
