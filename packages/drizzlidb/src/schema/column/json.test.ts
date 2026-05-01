import { describe, expect, expectTypeOf, it } from "bun:test";
import * as v from "valibot";
import z from "zod";
import { JsonColumnBuilder } from "./json";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

describe(JsonColumnBuilder.name, () => {
	it("should add a type-level schema upon initialization", () => {
		type TestType = {
			a: number;
			b: string[];
		};

		const j = JsonColumnBuilder<"schema", TestType>();

		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof j>["insertType"]
		>().toEqualTypeOf<TestType>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof j>["selectType"]
		>().toEqualTypeOf<TestType>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<typeof j>["updateType"]
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
		expect(
			valibotSchemaBuilder[PrivateBaseColumnBuilderProps.Config].validator,
		).toBeDefined();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof valibotSchemaBuilder
			>["insertType"]
		>().toEqualTypeOf<ValibotInput>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof valibotSchemaBuilder
			>["selectType"]
		>().toEqualTypeOf<ValibotOutput>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof valibotSchemaBuilder
			>["updateType"]
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
		expect(
			zodSchemaBuilder[PrivateBaseColumnBuilderProps.Config].validator,
		).toBeDefined();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof zodSchemaBuilder
			>["insertType"]
		>().toEqualTypeOf<ZodInput>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof zodSchemaBuilder
			>["selectType"]
		>().toEqualTypeOf<ZodOutput>();
		expectTypeOf<
			PrivateBaseColumnBuilderProps.GetState<
				typeof zodSchemaBuilder
			>["updateType"]
		>().toEqualTypeOf<ZodInput>();
	});
});
