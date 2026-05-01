// biome-ignore-all lint/complexity/noBannedTypes: <Just for a test example sake>
import { describe, expect, expectTypeOf, it } from "bun:test";
import { CustomColumnBuilder } from "./custom";
import type { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

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
		>()
			.unique()
			.codec({
				fromDb: CustomClass.fromIdb,
				toDb: (val) => val.toIdb(),
			});

		type ClassBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof classBuilder
		>;
		expectTypeOf<ClassBuilder["selectType"]>().toEqualTypeOf<CustomClass>();
		expectTypeOf<
			ClassBuilder["dbType"]
		>().toEqualTypeOf<SerializedCustomClass>();
	});

	it("should strongly type itself with `.codec()`", () => {
		const classBuilder = CustomColumnBuilder().codec({
			fromDb: CustomClass.fromIdb,
			toDb: (val) => val.toIdb(),
		});

		type ClassBuilder = PrivateBaseColumnBuilderProps.GetState<
			typeof classBuilder
		>;
		expectTypeOf<ClassBuilder["selectType"]>().toEqualTypeOf<CustomClass>();
		expectTypeOf<
			ClassBuilder["dbType"]
		>().toEqualTypeOf<SerializedCustomClass>();
	});

	it("should throw when `.codec()` is called twice", () => {
		const classBuilder = CustomColumnBuilder().codec({
			fromDb: CustomClass.fromIdb,
			toDb: (val) => val.toIdb(),
		});

		expect(() =>
			classBuilder.codec({
				fromDb: CustomClass.fromIdb,
				toDb: (val) => val.toIdb(),
			}),
		).toThrow();
	});
});
