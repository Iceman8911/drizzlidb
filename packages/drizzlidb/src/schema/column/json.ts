/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { IndexedDbJsonType, Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	type WithColumnBuilderState,
} from "./base";
import { PrivateBaseColumnBuilderProps } from "./shared/private-symbols";

interface JsonColumnGenerics extends BaseColumnGenerics {
	insertType: IndexedDbJsonType;
	selectType: IndexedDbJsonType;
	updateType: IndexedDbJsonType;
}

type DefaultJsonColumnGenerics<
	TSchema extends IndexedDbJsonType = IndexedDbJsonType,
> = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: TSchema;
		updateType: TSchema;
		insertType: TSchema;
	},
	JsonColumnGenerics
>;

interface JsonColumnBuilderConfig<
	TGenerics extends JsonColumnGenerics = JsonColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {
	// TODO: add base JSON  schema type
	schema?: unknown;
}

const DEFAULT_JSON_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies JsonColumnBuilderConfig;

type InferStandardSchemaInput<TSchema extends StandardSchemaV1> =
	StandardSchemaV1.InferInput<TSchema> extends IndexedDbJsonType
		? StandardSchemaV1.InferInput<TSchema>
		: "🚨 Input schema is not a compatible JSON object.";

type InferStandardSchemaOutput<TSchema extends StandardSchemaV1> =
	StandardSchemaV1.InferOutput<TSchema> extends IndexedDbJsonType
		? StandardSchemaV1.InferOutput<TSchema>
		: "🚨 Output schema is not a compatible JSON object.";

type WithStandardSchema<
	TBuilder extends _JsonColumnBuilder,
	TSchema extends StandardSchemaV1,
> = WithColumnBuilderState<
	TBuilder,
	{
		insertType: InferStandardSchemaInput<TSchema>;
		selectType: InferStandardSchemaOutput<TSchema>;
		updateType: InferStandardSchemaInput<TSchema>;
	}
>;

/** TODO: add standard schema support */
class _JsonColumnBuilder<
	const TName extends string = string,
	const TGenerics extends JsonColumnGenerics = JsonColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	declare readonly [PrivateBaseColumnBuilderProps.State]: TGenerics;
	override readonly [PrivateBaseColumnBuilderProps.Config]: JsonColumnBuilderConfig<
		PrivateBaseColumnBuilderProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: JsonColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_JSON_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateBaseColumnBuilderProps.Config] = config;
	}

	/** Attach a standard schema to improve inference and validation (The schema's validation method is automatically called when needed).
	 *
	 * This standard schema should be provided by any compliant validator library like zod, valibot, arktype, etc, so you can just pass those directly.
	 */
	schema<
		TStandardSchema extends StandardSchemaV1,
		TSelf extends _JsonColumnBuilder,
	>(
		this: TSelf,
		schema: TStandardSchema,
	): WithStandardSchema<TSelf, TStandardSchema> {
		return this[PrivateBaseColumnBuilderProps.Factory]<
			_JsonColumnBuilder,
			Partial<JsonColumnGenerics>,
			JsonColumnBuilderConfig
		>({
			validator: [
				async (val) => {
					const res = await schema["~standard"].validate(val);

					return "issues" in res ? res.issues?.join("\n\n") || false : true;
				},
			],
		}) as never;
	}
}

export const JsonColumnBuilder = <
	const TName extends string,
	TSchema extends IndexedDbJsonType,
>(
	name?: TName,
) => new _JsonColumnBuilder<TName, DefaultJsonColumnGenerics<TSchema>>(name);
