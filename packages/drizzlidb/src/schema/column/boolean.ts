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

interface BooleanColumnGenerics extends BaseColumnGenerics {
	type: boolean;
	dbType: boolean;
}

type DefaultBooleanColumnGenerics = Satisfies<
	Omit<DefaultBaseColumnGenerics, "type" | "dbType"> & {
		type: boolean;
		dbType: boolean;
	},
	BooleanColumnGenerics
>;

interface BooleanColumnBuilderConfig<
	TGenerics extends BooleanColumnGenerics = DefaultBooleanColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_BOOLEAN_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies BooleanColumnBuilderConfig;

class _BooleanColumnBuilder<
	const TName extends string = string,
	const TGenerics extends BooleanColumnGenerics = DefaultBooleanColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly _config: BooleanColumnBuilderConfig<typeof this._state>;

	constructor(
		name?: TName,
		config: BooleanColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_BOOLEAN_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}
}

export const BooleanColumnBuilder = <const TName extends string>(
	name?: TName,
) => new _BooleanColumnBuilder(name);
