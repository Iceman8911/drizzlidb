/** biome-ignore-all lint/suspicious/noExplicitAny: <To accept any builder type> */
import type { Promisable, SimplifyDeep } from "type-fest";
import type { Satisfies } from "../../shared/types";
import { clone, getRandomUuid, isNotUndefined } from "../../shared/util";
import { PrivateBaseColumnBuilderProps as PrivateProps } from "./shared/private-symbols";

export interface BaseColumnGenerics {
	hasDefaultVal: boolean;
	hasUpdateVal: boolean;
	indexName: string;
	/** Type when inserting data */
	insertType: any;
	isComputed: boolean;
	isIndex: boolean;
	isNullable: boolean;
	isPrimaryKey: boolean;
	isReadonly: boolean;
	isUniqueIndex: boolean;
	/** Type when reading data */
	selectType: any;
	/** Type when updating data.
	 *
	 * Always a union with `undefined`.
	 */
	updateType: any;
}

export type DefaultBaseColumnGenerics = Satisfies<
	{
		isNullable: false;
		selectType: any;
		insertType: any;
		updateType: any;
		hasDefaultVal: false;
		hasUpdateVal: false;
		isUniqueIndex: false;
		isIndex: false;
		indexName: string;
		isPrimaryKey: false;
		isComputed: false;
		isReadonly: false;
	},
	BaseColumnGenerics
>;

type CanBeComputed<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isComputed"]
		? false
		: // : true extends TGenerics["hasDefaultVal"]
			// 	? false
			// 	: true extends TGenerics["hasUpdateVal"]
			// 		? false
			true;

type CanBeNullable<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["hasDefaultVal"]
		? false
		: true extends TGenerics["hasUpdateVal"]
			? false
			: true extends TGenerics["isComputed"]
				? false
				: true extends TGenerics["isReadonly"]
					? false
					: true extends TGenerics["isPrimaryKey"]
						? false
						: true extends TGenerics["isNullable"]
							? false
							: true;

type CanBeReadonly<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isReadonly"] ? false : true;

type CanHaveDefaultVal<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isComputed"]
		? false
		: true extends TGenerics["hasDefaultVal"]
			? false
			: true;

type CanHaveUpdateVal<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isComputed"]
		? false
		: true extends TGenerics["isReadonly"]
			? false
			: true extends TGenerics["hasUpdateVal"]
				? false
				: true;

type CanHavePrimaryIndex<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isPrimaryKey"] ? false : true;

type CanHaveRegularIndex<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isIndex"] ? false : true;

type CanHaveUniqueIndex<TGenerics extends BaseColumnGenerics> =
	true extends TGenerics["isUniqueIndex"] ? false : true;

// ----------------------------------
// Column capability predicates
// These conditional types express what operations a column
// may accept based on its generic state (computed, readonly, etc).
// ----------------------------------

export type BaseColumnBuilderConfig<
	TGenerics extends BaseColumnGenerics = BaseColumnGenerics,
> = SimplifyDeep<
	Readonly<{
		/** If present, the column is mean to be an index */
		indexName?: string;

		defaultVal?:
			| NonNullable<TGenerics["insertType"]>
			| (() => Promisable<NonNullable<TGenerics["insertType"]>>);
		updater?:
			| NonNullable<TGenerics["insertType"]>
			| (() => Promisable<NonNullable<TGenerics["insertType"]>>);
		validator?: Array<
			(val: TGenerics["insertType"]) => Promisable<boolean | string>
		>;
		computation?: () => Promisable<NonNullable<TGenerics["selectType"]>>;

		isNullable?: boolean;
		isUniqueIndex?: boolean;
		isPrimaryKey?: boolean;
		isReadonly?: boolean;
	}>
>;

export const DEFAULT_COLUMN_BUILDER_CONFIG =
	{} as const satisfies BaseColumnBuilderConfig;

export type GetColumnBuilderState<TBuilder extends BaseColumnBuilder> =
	TBuilder extends {
		readonly [PrivateProps.State]: infer RGenerics;
	}
		? RGenerics
		: never;

/** Overwrite the builder's state with updates into a new type */
export type WithColumnBuilderState<
	TBuilder extends BaseColumnBuilder,
	TUpdates extends Partial<BaseColumnGenerics>,
> = SimplifyDeep<
	Omit<TBuilder, PrivateProps.State> & {
		readonly [PrivateProps.State]: {
			[K in keyof GetColumnBuilderState<TBuilder>]: K extends keyof TUpdates
				? NonNullable<TUpdates[K]>
				: GetColumnBuilderState<TBuilder>[K];
		};
	}
>;

// ----------------------------------
// Builder state transformation helpers
// These helpers return new builder types with updated `_state` fields
// reflecting changes like `.default()`, `.primary()`, `.readonly()`, etc.
// ----------------------------------

type WithBrand<
	TBuilder extends BaseColumnBuilder,
	TBrand extends string,
> = WithColumnBuilderState<
	TBuilder,
	{
		selectType: {
			__brand: TBrand;
		} & GetColumnBuilderState<TBuilder>["selectType"];
		insertType: {
			__brand: TBrand;
		} & GetColumnBuilderState<TBuilder>["insertType"];
		updateType: {
			__brand: TBrand;
		} & GetColumnBuilderState<TBuilder>["updateType"];
	}
>;

type WithComputed<TBuilder extends BaseColumnBuilder> = WithColumnBuilderState<
	TBuilder,
	{
		isComputed: true;
		isReadonly: true;
		isNullable: false;
		hasDefaultVal: false;
		hasUpdateVal: false;
		insertType: never;
		updateType: never;
		selectType: NonNullable<PrivateProps.GetState<TBuilder>["selectType"]>;
	}
>;

export type WithDefault<TBuilder extends BaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			hasDefaultVal: true;
			isNullable: false;
			insertType: PrivateProps.GetState<TBuilder>["insertType"] | undefined;
			selectType: NonNullable<PrivateProps.GetState<TBuilder>["selectType"]>;
		}
	>;

type WithIndex<
	TBuilder extends BaseColumnBuilder,
	TIdxName extends string = string,
> = WithColumnBuilderState<TBuilder, { indexName: TIdxName; isIndex: true }>;

type WithNullable<TBuilder extends BaseColumnBuilder> = WithColumnBuilderState<
	TBuilder,
	{
		isNullable: true;
		insertType: PrivateProps.GetState<TBuilder>["insertType"] | undefined;
		selectType: PrivateProps.GetState<TBuilder>["selectType"] | null;
	}
>;

type WithPrimary<
	TBuilder extends BaseColumnBuilder,
	TIdxName extends string = string,
> = WithColumnBuilderState<
	TBuilder,
	{
		isUniqueIndex: true;
		indexName: TIdxName;
		isPrimaryKey: true;
		isNullable: false;
		isIndex: true;
		selectType: NonNullable<PrivateProps.GetState<TBuilder>["selectType"]>;
	}
>;

type WithReadonly<TBuilder extends BaseColumnBuilder> = WithColumnBuilderState<
	TBuilder,
	{
		isReadonly: true;
		isNullable: false;
		hasUpdateVal: false;
		selectType: NonNullable<PrivateProps.GetState<TBuilder>["selectType"]>;
		updateType: never;
	}
>;

export type WithUpdate<TBuilder extends BaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			hasUpdateVal: true;
			isNullable: false;
			selectType: NonNullable<PrivateProps.GetState<TBuilder>["selectType"]>;
			// This commented line is unnecessary since all props in an update are optional by default
			// updateType: TBuilder[typeof PrivateColumnBuilderProps.State]["updateType"] | undefined
		}
	>;

type WithUnique<
	TBuilder extends BaseColumnBuilder,
	TIdxName extends string = string,
> = WithColumnBuilderState<
	TBuilder,
	{ isUniqueIndex: true; indexName: TIdxName; isIndex: true }
>;

export const DUPLICATED_CHAINER_ERROR_TEXT = "🚨 Can't call it twice either.";

// TODO: add a type-level error for custom column builders with data types not directly supported by structclone and wothout a propert transform
/** Do not add private or protected properties to this or it's sub classes since it messes up with inference.
 *
 * @internal
 *
 */
export abstract class BaseColumnBuilder<
	const TName extends string = string,
	const TGenerics extends BaseColumnGenerics = BaseColumnGenerics,
> {
	/** @internal */
	readonly [PrivateProps.Ctor] = this.constructor as {
		new <
			const TName extends string,
			const TGenerics extends BaseColumnGenerics,
		>(
			name?: TName,
			config?: BaseColumnBuilderConfig<TGenerics>,
		): any;
	};

	/** Keep this as a one-level flat object.
	 *
	 * @internal
	 */
	readonly [PrivateProps.Config]: BaseColumnBuilderConfig<
		PrivateProps.GetState<typeof this>
	>;

	/** Error messages.
	 *
	 * @internal
	 */
	readonly [PrivateProps.Err] = {
		computed: `${DUPLICATED_CHAINER_ERROR_TEXT}`,
		default: `🚨 Cannot set \`.default()\` value on a \`.computed()\` column. ${DUPLICATED_CHAINER_ERROR_TEXT}`,
		index:
			`🚨 An index of some kind already exists. Try removing any \`.primary()\` or \`.unique()\`. ${DUPLICATED_CHAINER_ERROR_TEXT}` as const,
		nullable: `🚨 Cannot enforce \`.nullable()\` when \`.computed()\`, \`.default()\`, \`.update()\`, \`.generated()\`, \`.readonly()\`, \`.primary()\` is present. ${DUPLICATED_CHAINER_ERROR_TEXT}`,
		primary: `${DUPLICATED_CHAINER_ERROR_TEXT}`,
		readonly: `${DUPLICATED_CHAINER_ERROR_TEXT}`,
		unique: `${DUPLICATED_CHAINER_ERROR_TEXT}`,
		updater: `🚨 Cannot add \`.update()\` when \`.readonly()\` or \`.computed()\`. ${DUPLICATED_CHAINER_ERROR_TEXT}`,
	} as const;

	/** If `.name` is specified, this is set to `.name` else a randomly generated string.
	 *
	 * @internal
	 */
	readonly [PrivateProps.RandName]: string;

	/** Type-level only generic state. Use this over `TGenerics`.
	 *
	 * @internal
	 */
	declare readonly [PrivateProps.State]: TGenerics;

	/** If specified, this name will be pritoritzed as the column name when built. */
	readonly name?: TName;

	constructor(
		name?: TName,
		config: BaseColumnBuilderConfig<any> = clone(DEFAULT_COLUMN_BUILDER_CONFIG),
	) {
		this.name = name;
		this[PrivateProps.RandName] = name ?? getRandomUuid();
		this[PrivateProps.Config] = config;
	}

	/** Reusable helper for returning a new immutable class instance
	 *
	 * @internal
	 */
	[PrivateProps.Factory]<
		TSelf extends BaseColumnBuilder,
		TUpdates extends Partial<BaseColumnGenerics>,
		TConfig extends Partial<BaseColumnBuilderConfig<any>> = Partial<
			BaseColumnBuilderConfig<PrivateProps.GetState<TSelf>>
		>,
	>(this: TSelf, updates: TConfig): WithColumnBuilderState<TSelf, TUpdates> {
		return new this[PrivateProps.Ctor](this.name, {
			...this[PrivateProps.Config],
			...updates,
			validator: [
				...(this[PrivateProps.Config].validator ?? []),
				...(updates.validator ?? []),
			],
		});
	}

	/** Brand the columns type for better uniqueness.
	 *
	 * Runtime-only.
	 */
	brand<const TBrand extends string, TSelf extends BaseColumnBuilder>(
		this: TSelf,
		_brand: TBrand,
	): WithBrand<TSelf, TBrand> {
		return this as never;
	}

	/** Creates a "fake" column computed from columns of the given table.
	 *
	 * The column will be removed from it's `insert` and `update` types entirely, and cannot be nullable.
	 *
	 * Implictly makes the column readonly.
	 *
	 * NOTE: Overrides `.nullable()`, `.default()`, `.update()`, `.readonly()`.
	 *
	 * @param ref reference to the table to compute from, e.g () => UserTable
	 */
	computed<TSelf extends BaseColumnBuilder, TTable>(
		this: TSelf,
		ref: () => TTable,
		compute: (
			table: TTable,
		) => Promisable<NonNullable<PrivateProps.GetState<TSelf>["selectType"]>>,
	): true extends CanBeComputed<PrivateProps.GetState<TSelf>>
		? WithComputed<TSelf>
		: PrivateProps.GetErr<TSelf>["computed"] {
		const { computation } = this[PrivateProps.Config];

		if (isNotUndefined(computation))
			throw Error(this[PrivateProps.Err].computed);

		return this[PrivateProps.Factory]({
			computation() {
				return compute(ref());
			},
			defaultVal: undefined,
			isNullable: true,
			isReadonly: true,
			updater: undefined,
		}) as never;
	}

	/** Set a default value or a callback that produces a value for the cell for `insert`s that don't provide a value.
	 *
	 * Differs from `.update()` in the sense that it is only applied on `insert`s to the relevant column, assuming a value wasn't explictly provided by the input.
	 *
	 * The column will be optional in it's `insert` type.
	 *
	 * NOTE: Overrides `.nullable()`. Is overidden by `.computed()`.
	 */
	default<TSelf extends BaseColumnBuilder>(
		this: TSelf,
		valOrFn: NonNullable<
			BaseColumnBuilderConfig<PrivateProps.GetState<TSelf>>["defaultVal"]
		>,
	): true extends CanHaveDefaultVal<PrivateProps.GetState<TSelf>>
		? WithDefault<TSelf>
		: PrivateProps.GetErr<TSelf>["default"] {
		const { computation, defaultVal } = this[PrivateProps.Config];

		if (isNotUndefined(computation) || isNotUndefined(defaultVal))
			throw Error(this[PrivateProps.Err].default);

		return this[PrivateProps.Factory]({
			defaultVal: valOrFn,
			isNullable: false,
		}) as never;
	}

	/** Creates an index for this column for fast querying.
	 *
	 * NOTE: Is overridden by `.unique()`, `.primary()`.
	 *
	 * @param name index name
	 */
	index<
		TSelf extends BaseColumnBuilder,
		const TIdxName extends string = `${TName}_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHaveRegularIndex<PrivateProps.GetState<TSelf>>
		? WithIndex<TSelf>
		: PrivateProps.GetErr<TSelf>["index"] {
		const oldIdxName = this[PrivateProps.Config].indexName;

		if (isNotUndefined(oldIdxName)) throw Error(this[PrivateProps.Err].index);

		return this[PrivateProps.Factory]({
			indexName: name ?? `${this[PrivateProps.RandName]}_idx`,
		}) as never;
	}

	/** Explicitly denotes that the column is nullable.
	 *
	 * The column will be optional in it's `insert` type.
	 *
	 * NOTE: Is overridden by `.default()`, `.update()`, `.computed()`, `.readonly()`, `.primary()`.
	 */
	nullable<TSelf extends BaseColumnBuilder>(
		this: TSelf,
	): true extends CanBeNullable<PrivateProps.GetState<TSelf>>
		? WithNullable<TSelf>
		: PrivateProps.GetErr<TSelf>["nullable"] {
		const {
			computation,
			defaultVal,
			updater,
			isReadonly,
			isPrimaryKey,
			isNullable,
		} = this[PrivateProps.Config];

		if (
			isNotUndefined(computation) ||
			isNotUndefined(defaultVal) ||
			isNotUndefined(updater) ||
			isReadonly ||
			isPrimaryKey ||
			isNullable
		)
			throw Error(this[PrivateProps.Err].nullable);

		return this[PrivateProps.Factory]({
			isNullable: true,
		}) as never;
	}

	/** Denotes that this column should be the primary key of a table.
	 *
	 * Implictly creates a unique index for this column.
	 *
	 * NOTE: Overrides `.index()`, `.nullable()`.
	 *
	 * @param name primary key index name
	 */
	primary<
		TSelf extends BaseColumnBuilder,
		const TIdxName extends string = `${TName}_primary_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHavePrimaryIndex<PrivateProps.GetState<TSelf>>
		? WithPrimary<TSelf, TIdxName>
		: PrivateProps.GetErr<TSelf>["primary"] {
		if (this[PrivateProps.Config].isPrimaryKey)
			throw Error(this[PrivateProps.Err].primary);

		return this[PrivateProps.Factory]({
			indexName: name ?? `${this[PrivateProps.RandName]}_primary_idx`,
			isNullable: false,
			isPrimaryKey: true,
			isUniqueIndex: true,
		}) as never;
	}

	/** Prevents modifications to this column after `insert`s.
	 *
	 * The column will be removed entirely from its `insert` and `update` types.
	 *
	 * NOTE: Overrides `.nullable()`, `.update()`.
	 */
	readonly<TSelf extends BaseColumnBuilder>(
		this: TSelf,
	): true extends CanBeReadonly<PrivateProps.GetState<TSelf>>
		? WithReadonly<TSelf>
		: PrivateProps.GetErr<TSelf>["readonly"] {
		if (this[PrivateProps.Config].isReadonly)
			throw Error(this[PrivateProps.Err].readonly);

		return this[PrivateProps.Factory]({
			isNullable: false,
			isReadonly: true,
			updater: undefined,
		}) as never;
	}

	/** `Update`s the cell when the row is updated without providing a respective value.
	 *
	 * Differs from `.default()` in the sense that it is only applied on `update`s to the relevant column, assuming a value wasn't explictly provided by the input.
	 *
	 * The column will be optional in it's `insert` type.
	 *
	 * NOTE: Overrides `.nullable()`. Is overridden by `.computed()`, `.readonly()`.
	 */
	update<TSelf extends BaseColumnBuilder>(
		this: TSelf,
		valOrFn: NonNullable<
			BaseColumnBuilderConfig<PrivateProps.GetState<TSelf>>["updater"]
		>,
	): true extends CanHaveUpdateVal<PrivateProps.GetState<TSelf>>
		? WithUpdate<TSelf>
		: PrivateProps.GetErr<TSelf>["updater"] {
		const { isReadonly, computation, updater } = this[PrivateProps.Config];

		if (isReadonly || isNotUndefined(computation) || isNotUndefined(updater))
			throw Error(this[PrivateProps.Err].updater);

		return this[PrivateProps.Factory]({
			isNullable: false,
			updater: valOrFn,
		}) as never;
	}

	/** Enforces that values in this column must be unique.
	 *
	 * Implictly creates an index for this column.
	 *
	 * NOTE: Overrides `.index()`.
	 *
	 * @param name unique index name
	 */
	unique<
		TSelf extends BaseColumnBuilder,
		const TIdxName extends string = `${TName}_unique_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHaveUniqueIndex<PrivateProps.GetState<TSelf>>
		? WithUnique<TSelf, TIdxName>
		: PrivateProps.GetErr<TSelf>["unique"] {
		if (this[PrivateProps.Config].isUniqueIndex)
			throw Error(this[PrivateProps.Err].unique);

		return this[PrivateProps.Factory]({
			indexName: name ?? `${this[PrivateProps.RandName]}_unique_idx`,
			isUniqueIndex: true,
		}) as never;
	}

	/** Validates inputs during inserts and updates.
	 *
	 * @param fns validator functions. Returns true if successful, false if unsuccessful, or a string for a custom error message
	 */
	validate<TSelf extends BaseColumnBuilder>(
		this: TSelf,
		...fns: Array<
			(
				val: PrivateProps.GetState<TSelf>["insertType"],
			) => Promisable<boolean | string>
		>
	): TSelf {
		return this[PrivateProps.Factory]({
			validator: fns,
		}) as never;
	}
}

export class Column {}
