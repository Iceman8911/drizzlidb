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

class _NumberColumnBuilder<
		const TName extends string = string,
		const TGenerics extends NumberColumnGenerics = DefaultNumberColumnGenerics,
	>
	extends BaseColumnBuilder<TName, TGenerics>
	implements _SharedColumnBuilderWithGenerated.Builder
{
	/** @internal */
	readonly _numErr = {
		autoIncrement: "🚨 Only `.primary()` keys can be autoincremented once.",
		generated: `${_SharedColumnBuilderWithGenerated.ERR_TEXT} \`.autoIncrement()\` counts too.`,
	} as const;

	override readonly _config: NumberColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: NumberColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_NUMBER_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}
	/** Make this primary key column autoincrement.
	 *
	 * This column will be optional in its `insert` type.
	 */
	autoIncrement<TSelf extends AnyNumberColumnBuilder>(
		this: TSelf,
	): true extends CanAutoIncrement<TSelf["_state"]>
		? WithAutoIncrement<TSelf>
		: TSelf["_numErr"]["autoIncrement"] {
		const { isPrimaryKey, isAutoIncrementing } = this._config;

		if (!isPrimaryKey || isAutoIncrementing)
			throw Error(this._numErr.autoIncrement);

		return this._factory<
			TSelf,
			Partial<NumberColumnGenerics>,
			NumberColumnBuilderConfig
		>({ isAutoIncrementing: true }) as never;
	}

	generated<TSelf extends AnyNumberColumnBuilder>(
		this: TSelf,
	): true extends _SharedColumnBuilderWithGenerated.CanGenerate<TSelf["_state"]>
		? true extends TSelf["_state"]["isAutoIncrementing"]
			? TSelf["_numErr"]["generated"]
			: _SharedColumnBuilderWithGenerated.WithGenerated<TSelf>
		: TSelf["_numErr"]["generated"] {
		return _SharedColumnBuilderWithGenerated.setMethod(
			this,
			this._numErr.generated,
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
