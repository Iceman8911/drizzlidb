import { describe, expect, expectTypeOf, it } from "bun:test";
import { StringColumnBuilder } from "./string";

describe(StringColumnBuilder.name, () => {
	it("should have `.enum()` should narrow type and add validator", () => {
		const b = StringColumnBuilder().enum(["a", "b"]);

		expect(b._config.validator?.[0]).toBeFunction();
		expectTypeOf<(typeof b)["_state"]["type"]>().toEqualTypeOf<"a" | "b">();
	});
});
