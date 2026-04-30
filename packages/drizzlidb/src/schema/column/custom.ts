/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { Promisable } from "type-fest";
import type { IndexedDbCompatibleType, Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
import {
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	type WithColumnBuilderState,
} from "./base";

interface CustomColumnGenerics extends BaseColumnGenerics {
	/** What is stored in indexedDB */
	dbType: IndexedDbCompatibleType;
	insertType: unknown;
	selectType: unknown;
	updateType: unknown;
}

type DefaultCustomColumnGenerics<
	TType = unknown,
	TDbType extends IndexedDbCompatibleType = IndexedDbCompatibleType,
> = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: TType;
		updateType: TType;
		insertType: TType;
		dbType: TDbType;
	},
	CustomColumnGenerics
>;

type AnyCustomColumnBuilder = _CustomColumnBuilder<
	string,
	Record<keyof CustomColumnGenerics, any>
>;

interface CustomColumnBuilderConfig<
	TGenerics extends CustomColumnGenerics = DefaultCustomColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {
	codec: {
		fromDb: (val: TGenerics["dbType"]) => Promisable<TGenerics["selectType"]>;
		toDb: (val: TGenerics["selectType"]) => Promisable<TGenerics["dbType"]>;
	};
}

const DEFAULT_CUSTOM_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
	codec: {
		fromDb: (val) => JSON.parse(JSON.stringify(val)),
		toDb: JSON.stringify,
	},
} as const satisfies CustomColumnBuilderConfig;

type WithTransform<
	TBuilder extends AnyCustomColumnBuilder,
	TType,
	TDbType extends IndexedDbCompatibleType,
> = WithColumnBuilderState<
	TBuilder,
	{ dbType: TDbType; selectType: TType; updateType: TType; insertType: TType }
>;

/** For custom types without a specific builder here. Like custom classes. */
class _CustomColumnBuilder<
	const TName extends string = string,
	const TGenerics extends CustomColumnGenerics = DefaultCustomColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly _config: CustomColumnBuilderConfig<typeof this._state>;

	readonly _customErr = {
		codec: "🚨 A codec has already been set, and cannot be replaced.",
	} as const;

	constructor(
		name?: TName,
		config: CustomColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_CUSTOM_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this._config = config;
	}

	/** Defines how custom data should be converted into and from types compatible with IndexedDB.
	 *
	 * Valuable for custom classes and anything else that cannot be natively represented in indexedDB.
	 */
	codec<
		TSelf extends AnyCustomColumnBuilder,
		TType = TSelf["_state"]["selectType"],
		TDbType extends IndexedDbCompatibleType = TSelf["_state"]["dbType"],
	>(
		this: TSelf,
		fn: NonNullable<
			CustomColumnBuilderConfig<
				Omit<TSelf["_state"], "selectType" | "updateType" | "insertType"> & {
					selectType: TType;
					updateType: TType;
					insertType: TType;
					dbType: TDbType;
				}
			>["codec"]
		>,
	): WithTransform<TSelf, TType, TDbType> {
		if (this._config.codec !== DEFAULT_CUSTOM_COLUMN_BUILDER_CONFIG.codec)
			throw Error(this._customErr.codec);

		return this._factory<
			TSelf,
			TGenerics,
			CustomColumnBuilderConfig<
				Omit<TSelf["_state"], "selectType" | "updateType" | "insertType"> & {
					selectType: TType;
					updateType: TType;
					insertType: TType;
					dbType: TDbType;
				}
			>
		>({
			codec: fn,
		}) as never;
	}
}

// TODO: Consider if it's better to force codecs in the constructor arg.
/** Please setup the transformations with `.codec()` since the default conversion relies on `JSON.stringify` / `JSON.parse`. */
export const CustomColumnBuilder = <
	const TName extends string,
	TType,
	TDbType extends IndexedDbCompatibleType,
>(
	name?: TName,
) =>
	new _CustomColumnBuilder<TName, DefaultCustomColumnGenerics<TType, TDbType>>(
		name,
	);
