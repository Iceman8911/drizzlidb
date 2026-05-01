/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
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

interface NumberColumnGenerics
	extends BaseColumnGenerics,
		_SharedColumnBuilderWithGenerated.Generics {
	insertType: number;
	isAutoIncrementing: boolean;
	selectType: number;
	updateType: number;
}

type DefaultNumberColumnGenerics = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		isAutoIncrementing: false;
		selectType: number;
		insertType: number;
		updateType: number;
		isGenerated: false;
	},
	NumberColumnGenerics
>;

type AnyNumberColumnBuilder = _NumberColumnBuilder<
	string,
	Record<keyof NumberColumnGenerics, any>
>;

interface NumberColumnBuilderConfig<
	TGenerics extends NumberColumnGenerics = DefaultNumberColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {
	isAutoIncrementing?: boolean;
}

const DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies NumberColumnBuilderConfig;

type CanAutoIncrement<TGenerics extends NumberColumnGenerics> =
	true extends TGenerics["isPrimaryKey"]
		? true extends TGenerics["isAutoIncrementing"]
			? false
			: true
		: false;

type WithNumberColumnBuilderState<
	TBuilder extends AnyNumberColumnBuilder,
	TUpdates extends Partial<NumberColumnGenerics>,
> = WithColumnBuilderState<TBuilder, TUpdates>;

type WithAutoIncrement<TBuilder extends AnyNumberColumnBuilder> =
	WithNumberColumnBuilderState<TBuilder, { isAutoIncrementing: true }>;

let generatedLastAt = 0,
	generatedCounter = 0;

const NumberError = Symbol(PrivateProps.getSymbolName("numErr"));

class _NumberColumnBuilder<
		const TName extends string = string,
		const TGenerics extends NumberColumnGenerics = DefaultNumberColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements _SharedColumnBuilderWithGenerated.Builder
{
	/** @internal */
	readonly [NumberError] = {
		autoIncrement:
			"🚨 Only `.autoIncrement()` can only be used once on `.primary()` key columns.",
		generated: `${_SharedColumnBuilderWithGenerated.ERR_TEXT} \`.autoIncrement()\` counts too.`,
	} as const;

	override readonly [PrivateProps.Config]: NumberColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: NumberColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}
	/** Make this primary key column autoincrement.
	 *
	 * This column will be optional in its `insert` type.
	 */
	autoIncrement<TSelf>(
		this: TSelf,
	): TSelf extends AnyNumberColumnBuilder
		? true extends CanAutoIncrement<PrivateProps.GetState<TSelf>>
			? WithAutoIncrement<TSelf>
			: TSelf[typeof NumberError]["autoIncrement"]
		: never {
		const self = this as _NumberColumnBuilder<TName, TGenerics>;

		const { isPrimaryKey, isAutoIncrementing } = self[PrivateProps.Config];

		if (!isPrimaryKey || isAutoIncrementing)
			throw Error(self[NumberError].autoIncrement);

		return self[PrivateProps.Factory]<
			typeof self,
			Partial<NumberColumnGenerics>,
			NumberColumnBuilderConfig
		>({ isAutoIncrementing: true }) as never;
	}

	generated<TSelf>(
		this: TSelf,
	): TSelf extends AnyNumberColumnBuilder
		? true extends _SharedColumnBuilderWithGenerated.CanGenerate<
				PrivateProps.GetState<TSelf>
			>
			? true extends PrivateProps.GetState<TSelf>["isAutoIncrementing"]
				? TSelf[typeof NumberError]["generated"]
				: _SharedColumnBuilderWithGenerated.WithGenerated<TSelf>
			: TSelf[typeof NumberError]["generated"]
		: never {
		const self = this as _NumberColumnBuilder<TName, TGenerics>;

		return _SharedColumnBuilderWithGenerated.setMethod(
			self,
			self[NumberError].generated,
			(): number => {
				const now = Date.now();

				if (now === generatedLastAt) {
					generatedCounter++;
				} else {
					generatedLastAt = now;
					generatedCounter = 0;
				}

				return now * 1024 + generatedCounter;
			},
		);
	}
}

export const NumberColumnBuilder = <const TName extends string>(name?: TName) =>
	new _NumberColumnBuilder(name);
