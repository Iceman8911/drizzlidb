/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	type WithDefault,
	type WithUpdate,
} from "./base";
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

interface DateColumnGenerics extends BaseColumnGenerics {
	insertType: Date;
	selectType: Date;
	updateType: Date;
}

type DefaultDateColumnGenerics = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: Date;
		insertType: Date;
		updateType: Date;
	},
	DateColumnGenerics
>;

interface DateColumnBuilderConfig<
	TGenerics extends DateColumnGenerics = DateColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_DATE_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies DateColumnBuilderConfig;

class _DateColumnBuilder<
	const TName extends string = string,
	const TGenerics extends DateColumnGenerics = DateColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	declare readonly [PrivateProps.State]: TGenerics;
	override readonly [PrivateProps.Config]: DateColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: DateColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_DATE_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	/** Like `.default()` but uses the current date. */
	defaultNow<TSelf extends _DateColumnBuilder>(
		this: TSelf,
	): WithDefault<TSelf> {
		return this[PrivateProps.Factory]({
			defaultVal: () => new Date(),
		}) as never;
	}

	/** Like `.update()` but uses the current date. */
	updateNow<TSelf extends _DateColumnBuilder>(this: TSelf): WithUpdate<TSelf> {
		return this[PrivateProps.Factory]({ updater: () => new Date() }) as never;
	}
}

export const DateColumnBuilder = <const TName extends string>(name?: TName) =>
	new _DateColumnBuilder<TName, DefaultDateColumnGenerics>(name);
