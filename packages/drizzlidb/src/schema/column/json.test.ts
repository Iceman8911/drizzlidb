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

		expectTypeOf<
			(typeof j)["_state"]["insertType"]
		>().toEqualTypeOf<TestType>();
		expectTypeOf<
			(typeof j)["_state"]["selectType"]
		>().toEqualTypeOf<TestType>();
		expectTypeOf<
			(typeof j)["_state"]["updateType"]
		>().toEqualTypeOf<TestType>();
	});

	it("should add a type-level schema and runtime validator from standard schema compliant validator libraries", () => {
		const ValibotSchema = v.object({
			bar: v.tuple([
				v.pipe(v.union([v.number(), v.string()]), v.toNumber()),
				v.string(),
			]),

			baz: v.object({
				fooBar: v.optional(v.bigint(), 5n),
			}),
			foo: v.number(),
		});
		type ValibotInput = v.InferInput<typeof ValibotSchema>;
		type ValibotOutput = v.InferOutput<typeof ValibotSchema>;

		const valibotSchemaBuilder = JsonColumnBuilder().schema(ValibotSchema);
		expect(valibotSchemaBuilder._config.validator).toBeDefined();
		expectTypeOf<
			(typeof valibotSchemaBuilder)["_state"]["insertType"]
		>().toEqualTypeOf<ValibotInput>();
		expectTypeOf<
			(typeof valibotSchemaBuilder)["_state"]["selectType"]
		>().toEqualTypeOf<ValibotOutput>();
		expectTypeOf<
			(typeof valibotSchemaBuilder)["_state"]["updateType"]
		>().toEqualTypeOf<ValibotInput>();

		const ZodSchema = z.object({
			bar: z.tuple([
				z.pipe(z.union([z.number(), z.string()]), z.coerce.number()),
				z.string(),
			]),

			baz: z.object({
				fooBar: z.bigint().optional().default(5n),
			}),
			foo: z.number(),
		});
		type ZodInput = z.input<typeof ZodSchema>;
		type ZodOutput = z.output<typeof ZodSchema>;

		const zodSchemaBuilder = JsonColumnBuilder().schema(ZodSchema);
		expect(zodSchemaBuilder._config.validator).toBeDefined();
		expectTypeOf<
			(typeof zodSchemaBuilder)["_state"]["insertType"]
		>().toEqualTypeOf<ZodInput>();
		expectTypeOf<
			(typeof zodSchemaBuilder)["_state"]["selectType"]
		>().toEqualTypeOf<ZodOutput>();
		expectTypeOf<
			(typeof zodSchemaBuilder)["_state"]["updateType"]
		>().toEqualTypeOf<ZodInput>();
	});
});
