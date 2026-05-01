/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */

import type { Satisfies } from "../../shared/types";
import { clone } from "../../shared/util";
import {
	type AnyBaseColumnBuilder,
	BaseColumnBuilder,
	type BaseColumnBuilderConfig,
	type BaseColumnGenerics,
	DEFAULT_COLUMN_BUILDER_CONFIG,
	type DefaultBaseColumnGenerics,
	DUPLICATED_CHAINER_ERROR_TEXT,
	type WithColumnBuilderState,
} from "./base";
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

type PrimitiveCtor =
	| StringConstructor
	| NumberConstructor
	| BooleanConstructor
	| BigIntConstructor
	| DateConstructor;

type InferPrimitive<TPrimitive extends PrimitiveCtor> =
	TPrimitive extends StringConstructor
		? string
		: TPrimitive extends NumberConstructor
			? number
			: TPrimitive extends BooleanConstructor
				? boolean
				: TPrimitive extends BigIntConstructor
					? bigint
					: TPrimitive extends DateConstructor
						? Date
						: never;

type InferPrimitives<TPrimitives extends PrimitiveCtor[]> =
	TPrimitives extends [
		infer Head extends PrimitiveCtor,
		...infer Tail extends PrimitiveCtor[],
	]
		? [InferPrimitive<Head>, ...InferPrimitives<Tail>]
		: [];

interface ArrayColumnGenerics extends BaseColumnGenerics {
	insertType: unknown[];
	isMultiEntryIndex: boolean;
	selectType: unknown[];
	updateType: unknown[];
}

type DefaultArrayColumnGenerics<TType = unknown> = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: TType[];
		updateType: TType[];
		insertType: TType[];
		isMultiEntryIndex: false;
	},
	ArrayColumnGenerics
>;

type AnyArrayColumnBuilder = _ArrayColumnBuilder<
	string,
	Record<keyof ArrayColumnGenerics, any>
>;

interface ArrayColumnBuilderConfig<
	TGenerics extends ArrayColumnGenerics = DefaultArrayColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {
	isMultiEntryIndex?: boolean;
}

const DEFAULT_ARRAY_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies ArrayColumnBuilderConfig;

/** For simplicity, multi entry indexes cannot be unique, since while technically legal, the uniqueness is checked per array element, so having 2 rows with ["a"], and ["a", "b"] is invalid in IDB. */
type CanHaveMultiEntryIndex<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isUniqueIndex"]
		? false
		: "isMultiEntryIndex" extends keyof TGenerics
			? true extends TGenerics["isMultiEntryIndex"]
				? false
				: true
			: true;

/** For simplicity, unique indexes cannot be multi entry, since while technically legal, the uniqueness is checked per array element, so having 2 rows with ["a"], and ["a", "b"] is invalid in IDB. */
type CanHaveUniqueIndex<
	TGenerics extends BaseColumnGenerics | ArrayColumnGenerics,
> = true extends TGenerics["isUniqueIndex"]
	? false
	: "isMultiEntryIndex" extends keyof TGenerics
		? true extends TGenerics["isMultiEntryIndex"]
			? false
			: true
		: true;

type IfCanHaveUnique<T extends AnyBaseColumnBuilder> =
	true extends CanHaveUniqueIndex<PrivateProps.GetState<T>> ? T : never;
type IfCannotHaveUnique<T extends AnyBaseColumnBuilder> =
	true extends CanHaveUniqueIndex<PrivateProps.GetState<T>> ? never : T;

type WithOf<
	TBuilder extends AnyArrayColumnBuilder,
	TType extends InferPrimitive<PrimitiveCtor>,
> = WithColumnBuilderState<
	TBuilder,
	{ selectType: TType[]; updateType: TType[]; insertType: TType[] }
>;

type WithUniqueIndex<
	TBuilder extends AnyBaseColumnBuilder,
	TIdxName extends string,
> = WithColumnBuilderState<
	TBuilder,
	{ isUniqueIndex: true; indexName: TIdxName; isIndex: true }
>;

type WithMultiEntryIndex<
	TBuilder extends AnyArrayColumnBuilder,
	TIdxName extends string,
> = WithColumnBuilderState<
	TBuilder,
	{ isMultiEntryIndex: true; indexName: TIdxName; isIndex: true }
>;

class _ArrayColumnBuilder<
	const TName extends string = string,
	const TGenerics extends ArrayColumnGenerics = DefaultArrayColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	override readonly [PrivateProps.Config]: ArrayColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	/** @internal */
	readonly _arrErr = {
		multiEntryOrUnique: `🚨 For simplicity, multi entry indexes cannot be unique and vice versa, since while technically legal, the uniqueness is checked per array element, so having 2 rows with [1], and [1, 2] is invalid in IDB. ${DUPLICATED_CHAINER_ERROR_TEXT}`,
	} as const;

	constructor(
		name?: TName,
		config: ArrayColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_ARRAY_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	/** Declare that the column stores an array of primitive values. If you need complex / deeply nested types, use the `jsonColumn()` builder.
	 *
	 * @param _ctors no runtime purpose. solely for type inference
	 *
	 * @example
	 *
	 * const numberArrayColumnBuilder = array("numberArray").of(Number);
	 *
	 * const stringOrBigIntArrayColumnBuilder = array("stringOrBigIntArray").of(String, BigInt);
	 *
	 * const dateArrayColumnBuilder = array().of(Date);
	 */
	of<
		TPrimitiveCtors extends PrimitiveCtor[],
		TSelf extends AnyArrayColumnBuilder,
	>(
		this: TSelf,
		..._ctors: TPrimitiveCtors
	): WithOf<TSelf, InferPrimitives<TPrimitiveCtors>[number]> {
		return this as never;
	}

	/**
	 * Enables IndexedDB multiEntry indexing for this column.
	 *
	 * When enabled, if the column value is an array, each element is
	 * indexed separately instead of indexing the array as a single value.
	 *
	 * Example:
	 *   tags = ["js", "ts"]
	 *
	 * Without multiEntry:
	 *   index stores: ["js", "ts"] as a single key
	 *
	 * With multiEntry:
	 *   index stores: "js" → row, "ts" → row
	 *
	 * Notes:
	 * - Does not apply to composite (multi-column) indexes.
	 * - Affects how equality queries on this field behave.
	 */
	multiEntry<
		TSelf extends AnyArrayColumnBuilder,
		const TIdxName extends string = `${TName}_multi_entry_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHaveMultiEntryIndex<PrivateProps.GetState<TSelf>>
		? WithMultiEntryIndex<TSelf, TIdxName>
		: TSelf["_arrErr"]["multiEntryOrUnique"] {
		const { isUniqueIndex, isMultiEntryIndex } = this[PrivateProps.Config];

		if (isUniqueIndex || isMultiEntryIndex)
			throw Error(this._arrErr.multiEntryOrUnique);

		return this[PrivateProps.Factory]({
			indexName: name ?? `${this[PrivateProps.RandName]}_multi_entry_idx`,
			isMultiEntryIndex: true,
		}) as never;
	}

	override unique<
		TSelf extends AnyBaseColumnBuilder,
		const TIdxName extends string = `${TName}_unique_idx`,
	>(
		this: IfCanHaveUnique<TSelf>,
		name?: TIdxName,
	): WithUniqueIndex<TSelf, TIdxName>;
	override unique<
		TSelf extends AnyArrayColumnBuilder,
		const TIdxName extends string = `${TName}_unique_idx`,
	>(
		this: IfCannotHaveUnique<TSelf>,
		name?: TIdxName,
	): TSelf["_arrErr"]["multiEntryOrUnique"];
	override unique(this: AnyArrayColumnBuilder, name?: string) {
		const { isUniqueIndex, isMultiEntryIndex } = this[PrivateProps.Config];

		if (isUniqueIndex || isMultiEntryIndex)
			throw Error(this._arrErr.multiEntryOrUnique);

		return super.unique(name) as never;
	}
}

/**
 *
 * @param name Optional name for the column in storage. Changing this WILL lose saved data.
 * @returns an array column builder instance
 *
 * @example
 *
 * // Declaring type via generic
 * const stringArrBuilder = array<"stringArr", string>("stringArr");
 *
 * // Declaring type via method chaining with primitive constructor
 * const numberArrBuilder = array("numberArr").of(Number);
 */
export const ArrayColumnBuilder = <
	const TName extends string,
	TTPrimitiveType extends InferPrimitive<PrimitiveCtor>,
>(
	name?: TName,
) =>
	new _ArrayColumnBuilder<TName, DefaultArrayColumnGenerics<TTPrimitiveType>>(
		name,
	);
