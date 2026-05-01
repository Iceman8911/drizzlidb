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
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

interface StringColumnGenerics
	extends BaseColumnGenerics,
		_SharedColumnBuilderWithGenerated.Generics {
	insertType: string;
	selectType: string;
	updateType: string;
}

type DefaultStringColumnGenerics = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: string;
		insertType: string;
		updateType: string;
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
> = WithColumnBuilderState<
	TBuilder,
	{
		insertType: TValues[number];
		updateType: TValues[number];
		selectType: TValues[number];
	}
>;

const StringError = Symbol(PrivateProps.getSymbolName("strErr"));

class _StringColumnBuilder<
		const TName extends string = string,
		const TGenerics extends StringColumnGenerics = DefaultStringColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements _SharedColumnBuilderWithGenerated.Builder
{
	/** @internal */
	readonly [StringError] = {
		enum: "🚨 Enum values must be a non-empty array of strings",
		generated: _SharedColumnBuilderWithGenerated.ERR_TEXT,
	} as const;

	override readonly [PrivateProps.Config]: StringColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: StringColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_STRING_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	/** Narrow string type to a union of literal values. */
	enum<TSelf, const TValues extends ReadonlyArray<string>>(
		this: TSelf,
		values: TValues,
	): WithEnum<TSelf extends AnyStringColumnBuilder ? TSelf : never, TValues> {
		const self = this as AnyStringColumnBuilder;

		if (!Array.isArray(values) || values.length === 0)
			throw Error(self[StringError].enum);

		return self[PrivateProps.Factory]<
			typeof self,
			Partial<StringColumnGenerics>,
			StringColumnBuilderConfig
		>({
			validator: [(v) => values.includes(v) || `Invalid enum value: ${v}`],
		}) as never;
	}

	generated<TSelf>(
		this: TSelf,
	): TSelf extends AnyStringColumnBuilder
		? true extends _SharedColumnBuilderWithGenerated.CanGenerate<
				PrivateProps.GetState<TSelf>
			>
			? _SharedColumnBuilderWithGenerated.WithGenerated<TSelf>
			: TSelf[typeof StringError]["generated"]
		: never {
		const self = this as AnyStringColumnBuilder;

		return _SharedColumnBuilderWithGenerated.setMethod(
			self,
			self[StringError].generated,
			getRandomUuid,
		);
	}
}

export const StringColumnBuilder = <const TName extends string>(name?: TName) =>
	new _StringColumnBuilder(name);
