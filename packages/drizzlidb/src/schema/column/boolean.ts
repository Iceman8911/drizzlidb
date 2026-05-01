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
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

interface BooleanColumnGenerics extends BaseColumnGenerics {
	insertType: boolean;
	selectType: boolean;
	updateType: boolean;
}

type DefaultBooleanColumnGenerics = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		insertType: boolean;
		selectType: boolean;
		updateType: boolean;
	},
	BooleanColumnGenerics
>;

interface BooleanColumnBuilderConfig<
	TGenerics extends BooleanColumnGenerics = BooleanColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_BOOLEAN_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies BooleanColumnBuilderConfig;

class _BooleanColumnBuilder<
	const TName extends string = string,
	const TGenerics extends BooleanColumnGenerics = BooleanColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	declare readonly [PrivateProps.State]: TGenerics;
	override readonly [PrivateProps.Config]: BooleanColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: BooleanColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_BOOLEAN_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}
}

export const BooleanColumnBuilder = <const TName extends string>(
	name?: TName,
) => new _BooleanColumnBuilder<TName, DefaultBooleanColumnGenerics>(name);
