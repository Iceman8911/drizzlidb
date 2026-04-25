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
} from "./column";

interface NumberColumnGenerics extends BaseColumnGenerics {
	type: number;
	dbType: number;
	isAutoIncrementing: boolean;
}

type DefaultNumberColumnGenerics = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		isAutoIncrementing: false;
		type: number;
		dbType: number;
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

class _NumberColumnBuilder<
	const TName extends string = string,
	const TGenerics extends NumberColumnGenerics = DefaultNumberColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	/** @internal */
	readonly _numErr = {
		...this._err,
		autoIncrement: "🚨 Only `.primary()` keys can be autoincremented once.",
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
		>({
			isAutoIncrementing: true,
		}) as never;
	}
}

export const NumberColumnBuilder = <const TName extends string>(name?: TName) =>
	new _NumberColumnBuilder(name);
