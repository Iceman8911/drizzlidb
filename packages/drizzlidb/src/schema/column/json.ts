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

interface JsonColumnGenerics extends BaseColumnGenerics {
	type: IndexedDbJsonType;
	dbType: IndexedDbJsonType;
}

type DefaultJsonColumnGenerics<
	TSchema extends IndexedDbJsonType = IndexedDbJsonType,
> = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		type: TSchema;
		dbType: TSchema;
	},
	JsonColumnGenerics
>;

type AnyJsonColumnBuilder = _JsonColumnBuilder<
	string,
	Record<keyof JsonColumnGenerics, any>
>;

interface JsonColumnBuilderConfig<
	TGenerics extends JsonColumnGenerics = DefaultJsonColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {
	// TODO: add base JSON  schema type
	schema?: unknown;
}

const DEFAULT_JSON_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies JsonColumnBuilderConfig;

type InferStandardSchema<TSchema extends StandardSchemaV1> =
	StandardSchemaV1.InferOutput<TSchema> extends IndexedDbJsonType
		? StandardSchemaV1.InferOutput<TSchema>
		: never;

type WithStandardSchema<
	TBuilder extends AnyJsonColumnBuilder,
	TSchema extends StandardSchemaV1,
> = WithColumnBuilderState<
	TBuilder,
	{ type: InferStandardSchema<TSchema>; dbType: InferStandardSchema<TSchema> }
>;

/** TODO: add standard schema support */
class _JsonColumnBuilder<
	const TName extends string = string,
	const TGenerics extends JsonColumnGenerics = DefaultJsonColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly _config: JsonColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: JsonColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_JSON_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}

	/** Attach a standard schema to improve inference and validation (The schema's validation method is automatically called when needed).
	 *
	 * This standard schema should be provided by any compliant validator library like zod, valibot, arktype, etc, so you can just pass those directly.
	 */
	schema<
		TStandardSchema extends StandardSchemaV1,
		TSelf extends AnyJsonColumnBuilder,
	>(
		this: TSelf,
		schema: TStandardSchema,
	): WithStandardSchema<TSelf, TStandardSchema> {
		return this._factory({
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
