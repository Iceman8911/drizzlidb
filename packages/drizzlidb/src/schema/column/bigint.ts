/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Satisfies } from "../../shared/types";
import { clone, isNotUndefined } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	type WithColumnBuilderState,
} from "./base";
import {
	COLUMN_BUILDER_GENERATED_ERROR_TEXT,
	type ColumnBuilderGenericWithGenerated,
	type ColumnBuilderWithGenerated,
} from "./shared/generated";

interface BigIntColumnGenerics
	extends BaseColumnGenerics,
		ColumnBuilderGenericWithGenerated {
	type: bigint;
	dbType: bigint;
}

type DefaultBigIntColumnGenerics = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		type: bigint;
		dbType: bigint;
		isGenerated: false;
	},
	BigIntColumnGenerics
>;

type AnyBigIntColumnBuilder = _BigIntColumnBuilder<
	string,
	Record<keyof BigIntColumnGenerics, any>
>;

interface BigIntColumnBuilderConfig<
	TGenerics extends BigIntColumnGenerics = DefaultBigIntColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies BigIntColumnBuilderConfig;

type WithBigIntColumnBuilderState<
	TBuilder extends AnyBigIntColumnBuilder,
	TUpdates extends Partial<BigIntColumnGenerics>,
> = WithColumnBuilderState<TBuilder, TUpdates>;

type WithGenerated<TBuilder extends AnyBigIntColumnBuilder> =
	WithBigIntColumnBuilderState<
		TBuilder,
		{ isGenerated: true; hasDefaultVal: true; isReadonly: true }
	>;

type CanGenerate<TGenerics extends BigIntColumnGenerics> =
	true extends TGenerics["isGenerated"]
		? false
		: true extends TGenerics["hasDefaultVal"]
			? false
			: true extends TGenerics["hasUpdateVal"]
				? false
				: true extends TGenerics["isComputed"]
					? false
					: true;

class _BigIntColumnBuilder<
		const TName extends string = string,
		const TGenerics extends BigIntColumnGenerics = DefaultBigIntColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements ColumnBuilderWithGenerated
{
	/** @internal */
	readonly _bigIntErr = {
		generated: COLUMN_BUILDER_GENERATED_ERROR_TEXT,
	} as const;

	override readonly _config: BigIntColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: BigIntColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}

	generated<TSelf extends AnyBigIntColumnBuilder>(
		this: TSelf,
	): true extends CanGenerate<TSelf["_state"]>
		? WithGenerated<TSelf>
		: TSelf["_bigIntErr"]["generated"] {
		const { defaultVal, updater, computation } = this._config;

		if (
			isNotUndefined(defaultVal) ||
			isNotUndefined(updater) ||
			isNotUndefined(computation)
		)
			throw Error(this._bigIntErr.generated);

		return this._factory<
			TSelf,
			Partial<BigIntColumnGenerics>,
			BigIntColumnBuilderConfig
		>({
			defaultVal(): bigint {
				const time = BigInt(Date.now());
				const rand = BigInt(Math.floor(Math.random() * 1e6));
				return (time << 20n) | rand;
			},
		}) as never;
	}
}

export const BigIntColumnBuilder = <const TName extends string>(name?: TName) =>
	new _BigIntColumnBuilder(name);
