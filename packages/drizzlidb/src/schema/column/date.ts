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

interface DateColumnGenerics extends BaseColumnGenerics {
	type: Date;
	dbType: Date;
}

type DefaultDateColumnGenerics = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		type: Date;
		dbType: Date;
	},
	DateColumnGenerics
>;

interface DateColumnBuilderConfig<
	TGenerics extends DateColumnGenerics = DefaultDateColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_DATE_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies DateColumnBuilderConfig;

type AnyDateColumnBuilder = _DateColumnBuilder<
	string,
	Record<keyof DateColumnGenerics, any>
>;

class _DateColumnBuilder<
	const TName extends string = string,
	const TGenerics extends DateColumnGenerics = DefaultDateColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly _config: DateColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: DateColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_DATE_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}

	/** Like `.default()` but uses the current date. */
	defaultNow<TSelf extends AnyDateColumnBuilder>(
		this: TSelf,
	): WithDefault<TSelf> {
		return this._factory({ defaultVal: () => new Date() }) as never;
	}

	/** Like `.update()` but uses the current date. */
	updateNow<TSelf extends AnyDateColumnBuilder>(
		this: TSelf,
	): WithUpdate<TSelf> {
		return this._factory({ updater: () => new Date() }) as never;
	}
}

export const DateColumnBuilder = <const TName extends string>(name?: TName) =>
	new _DateColumnBuilder(name);
