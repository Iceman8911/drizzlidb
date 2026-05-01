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
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

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

type CodecConfig<
	TSelf extends AnyCustomColumnBuilder,
	TType,
	TDbType extends IndexedDbCompatibleType,
> = CustomColumnBuilderConfig<
	Omit<
		PrivateProps.GetState<TSelf>,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: TType;
		updateType: TType;
		insertType: TType;
		dbType: TDbType;
	}
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

const CustomError = Symbol(PrivateProps.getSymbolName("customErr"));

/** For custom types without a specific builder here. Like custom classes. */
class _CustomColumnBuilder<
	const TName extends string = string,
	const TGenerics extends CustomColumnGenerics = DefaultCustomColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly [PrivateProps.Config]: CustomColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	readonly [CustomError] = {
		codec: "🚨 A codec has already been set, and cannot be replaced.",
	} as const;

	constructor(
		name?: TName,
		config: CustomColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_CUSTOM_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	/** Defines how custom data should be converted into and from types compatible with IndexedDB.
	 *
	 * Valuable for custom classes and anything else that cannot be natively represented in indexedDB.
	 */
	codec<
		TSelf,
		TType = TSelf extends AnyCustomColumnBuilder
			? PrivateProps.GetState<TSelf>["selectType"]
			: never,
		TDbType extends
			IndexedDbCompatibleType = TSelf extends AnyCustomColumnBuilder
			? PrivateProps.GetState<TSelf>["dbType"]
			: never,
	>(
		this: TSelf,
		fn: NonNullable<
			CodecConfig<
				TSelf extends AnyCustomColumnBuilder ? TSelf : never,
				TType,
				TDbType
			>["codec"]
		>,
	): WithTransform<
		TSelf extends AnyCustomColumnBuilder ? TSelf : never,
		TType,
		TDbType
	> {
		const self = this as AnyCustomColumnBuilder;

		if (
			self[PrivateProps.Config].codec !==
			DEFAULT_CUSTOM_COLUMN_BUILDER_CONFIG.codec
		)
			throw Error(self[CustomError].codec);

		return self[PrivateProps.Factory]<
			typeof self,
			TGenerics,
			CodecConfig<typeof self, TType, TDbType>
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
