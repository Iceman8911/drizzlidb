import { describe, expect, expectTypeOf, it } from "bun:test";
import { DateColumnBuilder } from "./date";

describe(DateColumnBuilder.name, () => {
	it("should support `.defaultNow()`", () => {
		const d1 = DateColumnBuilder("created").defaultNow();
		expect(d1._config.defaultVal).toBeFunction();
		expectTypeOf<(typeof d1)["_state"]["type"]>().toEqualTypeOf<Date>();
		expectTypeOf<(typeof d1)["_state"]["dbType"]>().toEqualTypeOf<Date>();
	});

	it("should support `.updateNow()`", () => {
		const d2 = DateColumnBuilder("updated").updateNow();
		expect(d2._config.updater).toBeFunction();
		expectTypeOf<(typeof d2)["_state"]["type"]>().toEqualTypeOf<Date>();
		expectTypeOf<(typeof d2)["_state"]["dbType"]>().toEqualTypeOf<Date>();
	});
});
