import { describe, expect, expectTypeOf, it } from "bun:test";
import * as v from "valibot";
import z from "zod";
import { JsonColumnBuilder } from "./json";

describe(JsonColumnBuilder.name, () => {
	it("should add a type-level schema upon initialization", () => {
		type TestType = {
			a: number;
			b: string[];
		};

		const j = JsonColumnBuilder<"schema", TestType>();

		expectTypeOf<(typeof j)["_state"]["type"]>().toEqualTypeOf<TestType>();
		expectTypeOf<(typeof j)["_state"]["dbType"]>().toEqualTypeOf<TestType>();
	});

	it("should add a type-level schema and runtime validator from standard schema compliant validator libraries", () => {
		const ValibotSchema = v.object({
			bar: v.tuple([v.number(), v.string()]),

			baz: v.object({
				fooBar: v.bigint(),
			}),
			foo: v.number(),
		});
		type ValibotSchema = v.InferOutput<typeof ValibotSchema>;

		const valibotSchemaBuilder = JsonColumnBuilder().schema(ValibotSchema);
		expect(valibotSchemaBuilder._config.validator).toBeDefined();
		expectTypeOf<
			(typeof valibotSchemaBuilder)["_state"]["type"]
		>().toEqualTypeOf<ValibotSchema>();
		expectTypeOf<
			(typeof valibotSchemaBuilder)["_state"]["dbType"]
		>().toEqualTypeOf<ValibotSchema>();

		const ZodSchema = z.object({
			bar: z.tuple([z.number(), z.string()]),

			baz: z.object({
				fooBar: z.bigint(),
			}),
			foo: z.number(),
		});
		type ZodSchema = z.infer<typeof ZodSchema>;

		const zodSchemaBuilder = JsonColumnBuilder().schema(ZodSchema);
		expect(zodSchemaBuilder._config.validator).toBeDefined();
		expectTypeOf<
			(typeof zodSchemaBuilder)["_state"]["type"]
		>().toEqualTypeOf<ZodSchema>();
		expectTypeOf<
			(typeof zodSchemaBuilder)["_state"]["dbType"]
		>().toEqualTypeOf<ZodSchema>();
	});
});
