/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
} from "./base";
import { _SharedColumnBuilderWithGenerated } from "./shared/generated";
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

interface BigIntColumnGenerics
	extends BaseColumnGenerics,
		_SharedColumnBuilderWithGenerated.Generics {
	insertType: bigint;
	selectType: bigint;
	updateType: bigint;
}

type DefaultBigIntColumnGenerics = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: bigint;
		insertType: bigint;
		updateType: bigint;
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

// type WithBigIntColumnBuilderState<
// 	TBuilder extends AnyBigIntColumnBuilder,
// 	TUpdates extends Partial<BigIntColumnGenerics>,
// > = WithColumnBuilderState<TBuilder, TUpdates>;

const BigIntErr = Symbol(PrivateProps.getSymbolName("bigIntErr"));

class _BigIntColumnBuilder<
		const TName extends string = string,
		const TGenerics extends BigIntColumnGenerics = DefaultBigIntColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements _SharedColumnBuilderWithGenerated.Builder
{
	/** @internal */
	readonly [BigIntErr] = {
		generated: _SharedColumnBuilderWithGenerated.ERR_TEXT,
	} as const;

	override readonly [PrivateProps.Config]: BigIntColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: BigIntColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	generated<TSelf extends AnyBigIntColumnBuilder>(
		this: TSelf,
	): true extends _SharedColumnBuilderWithGenerated.CanGenerate<
		PrivateProps.GetState<TSelf>
	>
		? _SharedColumnBuilderWithGenerated.WithGenerated<TSelf>
		: TSelf[typeof BigIntErr]["generated"] {
		return _SharedColumnBuilderWithGenerated.setMethod(
			this,
			this[BigIntErr].generated,
			(): bigint => {
				const time = BigInt(Date.now());

				const randBufOf32Bits = new Uint32Array(1) as Uint32Array;
				crypto.getRandomValues(randBufOf32Bits);

				const rand = BigInt(randBufOf32Bits[0] ?? 0);

				return (time << 32n) | rand;
			},
		);
	}
}

export const BigIntColumnBuilder = <const TName extends string>(name?: TName) =>
	new _BigIntColumnBuilder(name);
