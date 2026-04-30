/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Satisfies } from "../../shared/types";
import { clone, getRandomUuid } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	type WithColumnBuilderState,
} from "./base";
import { _SharedColumnBuilderWithGenerated } from "./shared/generated";

interface StringColumnGenerics
	extends BaseColumnGenerics,
		_SharedColumnBuilderWithGenerated.Generics {
	type: string;
	dbType: string;
}

type DefaultStringColumnGenerics = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		type: string;
		dbType: string;
		isGenerated: false;
	},
	StringColumnGenerics
>;

type AnyStringColumnBuilder = _StringColumnBuilder<
	string,
	Record<keyof StringColumnGenerics, any>
>;

interface StringColumnBuilderConfig<
	TGenerics extends StringColumnGenerics = DefaultStringColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_STRING_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies StringColumnBuilderConfig;

type WithEnum<
	TBuilder extends AnyStringColumnBuilder,
	TValues extends readonly string[],
> = WithColumnBuilderState<TBuilder, { type: TValues[number] }>;

class _StringColumnBuilder<
		const TName extends string = string,
		const TGenerics extends StringColumnGenerics = DefaultStringColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements _SharedColumnBuilderWithGenerated.Builder
{
	/** @internal */
	readonly _strErr = {
		enum: "🚨 Enum values must be a non-empty array of strings",
		generated: _SharedColumnBuilderWithGenerated.ERR_TEXT,
	} as const;

	override readonly _config: StringColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: StringColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_STRING_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}

	/** Narrow string type to a union of literal values. */
	enum<
		TSelf extends AnyStringColumnBuilder,
		const TValues extends ReadonlyArray<string>,
	>(this: TSelf, values: TValues): WithEnum<TSelf, TValues> {
		if (!Array.isArray(values) || values.length === 0)
			throw Error(this._strErr.enum);

		return this._factory<
			TSelf,
			Partial<StringColumnGenerics>,
			StringColumnBuilderConfig
		>({
			validator: [(v) => values.includes(v) || `Invalid enum value: ${v}`],
		}) as never;
	}

	generated<TSelf extends AnyStringColumnBuilder>(
		this: TSelf,
	): true extends _SharedColumnBuilderWithGenerated.CanGenerate<TSelf["_state"]>
		? _SharedColumnBuilderWithGenerated.WithGenerated<TSelf>
		: TSelf["_strErr"]["generated"] {
		return _SharedColumnBuilderWithGenerated.setMethod(
			this,
			this._strErr.generated,
			getRandomUuid,
		);
	}
}

export const StringColumnBuilder = <const TName extends string>(name?: TName) =>
	new _StringColumnBuilder(name);
