import { describe, expect, expectTypeOf, it } from "bun:test";
import { BooleanColumnBuilder } from "./boolean";

describe(BooleanColumnBuilder.name, () => {
	it("default should set default and preserve type", () => {
		const b = BooleanColumnBuilder("flag").default(true);
		expect(b._config.defaultVal).toBe(true);
		expectTypeOf<(typeof b)["_state"]["selectType"]>().toEqualTypeOf<boolean>();
	});
});
