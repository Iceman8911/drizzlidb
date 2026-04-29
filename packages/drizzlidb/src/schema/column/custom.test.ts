// biome-ignore-all lint/complexity/noBannedTypes: <Just for a test example sake>
import { describe, expectTypeOf, it } from "bun:test";
import { CustomColumnBuilder } from "./custom";

type SerializedCustomClass = {
	name: string;
	age: number;
};

class CustomClass {
	constructor(
		public name = "Bob",
		public age = 37,
	) {}

	static fromIdb(val: SerializedCustomClass): CustomClass {
		return new CustomClass(val.name, val.age);
	}

	getId() {
		return `${this.name}-${this.age}`;
	}

	toIdb(): SerializedCustomClass {
		return { ...this };
	}
}

describe(CustomColumnBuilder.name, () => {
	it("should strongly type itself with generics", () => {
		const classBuilder = CustomColumnBuilder<
			string,
			CustomClass,
			SerializedCustomClass
		>().codec({
			fromDb: CustomClass.fromIdb,
			toDb: (val) => val.toIdb(),
		});

		type FunctionBuilder = typeof classBuilder._state;
		expectTypeOf<FunctionBuilder["type"]>().toEqualTypeOf<CustomClass>();
		expectTypeOf<
			FunctionBuilder["dbType"]
		>().toEqualTypeOf<SerializedCustomClass>();
	});

	it("should strongly type itself with `.codec()`", () => {
		const classBuilder = CustomColumnBuilder().codec({
			fromDb: CustomClass.fromIdb,
			toDb: (val) => val.toIdb(),
		});

		type FunctionBuilder = typeof classBuilder._state;
		expectTypeOf<FunctionBuilder["type"]>().toEqualTypeOf<CustomClass>();
		expectTypeOf<
			FunctionBuilder["dbType"]
		>().toEqualTypeOf<SerializedCustomClass>();
	});
});
