import { describe, expect, expectTypeOf, it } from "bun:test";
import { BooleanColumnBuilder } from "./boolean";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(BooleanColumnBuilder.name, () => {
	it("default should set default and preserve type", () => {
		const b = BooleanColumnBuilder("flag").default(true);
		expect(b[PrivateBaseColumnBuilderProps.Config].defaultVal).toBe(true);
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof b>["selectType"]
		>().toEqualTypeOf<boolean>();
	});
});
