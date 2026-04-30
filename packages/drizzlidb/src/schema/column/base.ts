/** biome-ignore-all lint/suspicious/noExplicitAny: <To accept any builder type> */
import type { Merge, Promisable } from "type-fest";
import type { Satisfies } from "../../shared/types";
import { clone, getRandomUuid, isNotUndefined } from "../../shared/util";

export interface BaseColumnGenerics {
	hasDefaultVal: boolean;
	hasUpdateVal: boolean;
	indexName: string;
	/** Type when inserting data */
	insertType: unknown;
	isComputed: boolean;
	isIndex: boolean;
	isNullable: boolean;
	isPrimaryKey: boolean;
	isReadonly: boolean;
	isUniqueIndex: boolean;
	/** Type when reading data */
	selectType: unknown;
	/** Type when updating data.
	 *
	 * Always a union with `undefined`.
	 */
	updateType: unknown;
}

export type AnyBaseColumnBuilder = BaseColumnBuilder<
	string,
	Record<keyof BaseColumnGenerics, any>
>;

export type DefaultBaseColumnGenerics = Satisfies<
	{
		isNullable: false;
		selectType: unknown;
		insertType: unknown;
		updateType: unknown;
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
	TGenerics extends BaseColumnGenerics = DefaultBaseColumnGenerics,
> = Readonly<{
	/** If present, the column is mean to be an index */
	indexName?: string;

	defaultVal?:
		| NonNullable<TGenerics["insertType"]>
		| (() => Promisable<NonNullable<TGenerics["insertType"]>>);
	updater?:
		| NonNullable<TGenerics["insertType"]>
		| (() => Promisable<NonNullable<TGenerics["insertType"]>>);
	validator?: Array<
		(val: NonNullable<TGenerics["insertType"]>) => Promisable<boolean | string>
	>;
	computation?: () => Promisable<NonNullable<TGenerics["selectType"]>>;

	isNullable?: boolean;
	isUniqueIndex?: boolean;
	isPrimaryKey?: boolean;
	isReadonly?: boolean;
}>;

export const DEFAULT_COLUMN_BUILDER_CONFIG =
	{} as const satisfies BaseColumnBuilderConfig;

export type GetColumnBuilderState<TBuilder extends AnyBaseColumnBuilder> =
	TBuilder extends {
		readonly _state: infer RGenerics;
	}
		? RGenerics
		: never;

/** Workaround for self-referencing generic? */
export type WithColumnBuilderState<
	TBuilder extends AnyBaseColumnBuilder,
	TUpdates extends Partial<BaseColumnGenerics>,
> = Merge<
	TBuilder,
	{
		readonly _state: {
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
	TBuilder extends AnyBaseColumnBuilder,
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

type WithComputed<TBuilder extends AnyBaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			isComputed: true;
			isReadonly: true;
			isNullable: false;
			hasDefaultVal: false;
			hasUpdateVal: false;
			insertType: never;
			updateType: never;
			selectType: NonNullable<TBuilder["_state"]["selectType"]>;
		}
	>;

export type WithDefault<TBuilder extends AnyBaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			hasDefaultVal: true;
			isNullable: false;
			insertType: TBuilder["_state"]["insertType"] | undefined;
			selectType: NonNullable<TBuilder["_state"]["selectType"]>;
		}
	>;

type WithIndex<
	TBuilder extends AnyBaseColumnBuilder,
	TIdxName extends string = string,
> = WithColumnBuilderState<TBuilder, { indexName: TIdxName; isIndex: true }>;

type WithNullable<TBuilder extends AnyBaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			isNullable: true;
			insertType: TBuilder["_state"]["insertType"] | undefined;
			selectType: TBuilder["_state"]["selectType"] | null;
		}
	>;

type WithPrimary<
	TBuilder extends AnyBaseColumnBuilder,
	TIdxName extends string = string,
> = WithColumnBuilderState<
	TBuilder,
	{
		isUniqueIndex: true;
		indexName: TIdxName;
		isPrimaryKey: true;
		isNullable: false;
		isIndex: true;
		selectType: NonNullable<TBuilder["_state"]["selectType"]>;
	}
>;

type WithReadonly<TBuilder extends AnyBaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			isReadonly: true;
			isNullable: false;
			hasUpdateVal: false;
			selectType: NonNullable<TBuilder["_state"]["selectType"]>;
			updateType: never;
		}
	>;

export type WithUpdate<TBuilder extends AnyBaseColumnBuilder> =
	WithColumnBuilderState<
		TBuilder,
		{
			hasUpdateVal: true;
			isNullable: false;
			selectType: NonNullable<TBuilder["_state"]["selectType"]>;
			// This commented line is unnecessary since all props in an update are optional by default
			// updateType: TBuilder["_state"]["updateType"] | undefined
		}
	>;

type WithUnique<
	TBuilder extends AnyBaseColumnBuilder,
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
	const TGenerics extends BaseColumnGenerics = DefaultBaseColumnGenerics,
> {
	/** @internal */
	readonly _ctor = this.constructor as {
		new <
			const TName extends string,
			const TGenerics extends BaseColumnGenerics = DefaultBaseColumnGenerics,
		>(
			name?: TName,
			config?: BaseColumnBuilderConfig<TGenerics>,
		): any;
	};

	/** Keep this as a one-level flat object.
	 *
	 * @internal
	 */
	readonly _config: BaseColumnBuilderConfig<typeof this._state>;

	/** Error messages.
	 *
	 * @internal
	 */
	readonly _err = {
		computed: `${DUPLICATED_CHAINER_ERROR_TEXT}`,
		default: `🚨 Cannot set \`.default()\` value on a \`.computed()\` column. ${DUPLICATED_CHAINER_ERROR_TEXT}`,
		index: (oldIdxName: (typeof this._state)["indexName"]) =>
			`🚨 An index named '${oldIdxName}' already exists. Try removing any \`.primary()\` or \`.unique()\`. ${DUPLICATED_CHAINER_ERROR_TEXT}` as const,
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
	readonly _randName: string;

	/** Type-level only generic state. Use this over `TGenerics`.
	 *
	 * @internal
	 */
	declare readonly _state: TGenerics;

	/** If specified, this name will be pritoritzed as the column name when built. */
	readonly name?: TName;

	constructor(
		name?: TName,
		config: BaseColumnBuilderConfig<typeof this._state> = clone(
			DEFAULT_COLUMN_BUILDER_CONFIG,
		),
	) {
		this.name = name;
		this._randName = name ?? getRandomUuid();
		this._config = config;
	}

	/**
	 * @internal
	 */
	_factory<
		TSelf extends AnyBaseColumnBuilder,
		TUpdates extends Partial<BaseColumnGenerics>,
		TConfig extends Partial<BaseColumnBuilderConfig<any>> = Partial<
			BaseColumnBuilderConfig<TSelf["_state"]>
		>,
	>(this: TSelf, updates: TConfig): WithColumnBuilderState<TSelf, TUpdates> {
		return new this._ctor(this.name, {
			...this._config,
			...updates,
			validator: [
				...(this._config.validator ?? []),
				...(updates.validator ?? []),
			],
		});
	}

	/** Brand the columns type for better uniqueness.
	 *
	 * Runtime-only.
	 */
	brand<const TBrand extends string, TSelf extends AnyBaseColumnBuilder>(
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
	computed<TSelf extends AnyBaseColumnBuilder, TTable>(
		this: TSelf,
		ref: () => TTable,
		compute: (
			table: TTable,
		) => Promisable<NonNullable<TSelf["_state"]["selectType"]>>,
	): true extends CanBeComputed<TSelf["_state"]>
		? WithComputed<TSelf>
		: TSelf["_err"]["computed"] {
		const { computation } = this._config;

		if (isNotUndefined(computation)) throw Error(this._err.computed);

		return this._factory({
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
	default<TSelf extends AnyBaseColumnBuilder>(
		this: TSelf,
		valOrFn: NonNullable<
			BaseColumnBuilderConfig<TSelf["_state"]>["defaultVal"]
		>,
	): true extends CanHaveDefaultVal<TSelf["_state"]>
		? WithDefault<TSelf>
		: typeof this._err.default {
		const { computation, defaultVal } = this._config;

		if (isNotUndefined(computation) || isNotUndefined(defaultVal))
			throw Error(this._err.default);

		return this._factory({
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
		TSelf extends AnyBaseColumnBuilder,
		const TIdxName extends string = `${TName}_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHaveRegularIndex<TSelf["_state"]>
		? WithIndex<TSelf>
		: ReturnType<TSelf["_err"]["index"]> {
		const oldIdxName = this._config.indexName;

		if (isNotUndefined(oldIdxName)) throw Error(this._err.index(oldIdxName));

		return this._factory({
			indexName: name ?? `${this._randName}_idx`,
		}) as never;
	}

	/** Explicitly denotes that the column is nullable.
	 *
	 * The column will be optional in it's `insert` type.
	 *
	 * NOTE: Is overridden by `.default()`, `.update()`, `.computed()`, `.readonly()`, `.primary()`.
	 */
	nullable<TSelf extends AnyBaseColumnBuilder>(
		this: TSelf,
	): true extends CanBeNullable<TSelf["_state"]>
		? WithNullable<TSelf>
		: TSelf["_err"]["nullable"] {
		const {
			computation,
			defaultVal,
			updater,
			isReadonly,
			isPrimaryKey,
			isNullable,
		} = this._config;

		if (
			isNotUndefined(computation) ||
			isNotUndefined(defaultVal) ||
			isNotUndefined(updater) ||
			isReadonly ||
			isPrimaryKey ||
			isNullable
		)
			throw Error(this._err.nullable);

		return this._factory({ isNullable: true }) as never;
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
		TSelf extends AnyBaseColumnBuilder,
		const TIdxName extends string = `${TName}_primary_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHavePrimaryIndex<TSelf["_state"]>
		? WithPrimary<TSelf, TIdxName>
		: TSelf["_err"]["primary"] {
		if (this._config.isPrimaryKey) throw Error(this._err.primary);

		return this._factory({
			indexName: name ?? `${this._randName}_primary_idx`,
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
	readonly<TSelf extends AnyBaseColumnBuilder>(
		this: TSelf,
	): true extends CanBeReadonly<TSelf["_state"]>
		? WithReadonly<TSelf>
		: TSelf["_err"]["readonly"] {
		if (this._config.isReadonly) throw Error(this._err.readonly);

		return this._factory({
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
	update<TSelf extends AnyBaseColumnBuilder>(
		this: TSelf,
		valOrFn: NonNullable<BaseColumnBuilderConfig<TSelf["_state"]>["updater"]>,
	): true extends CanHaveUpdateVal<TSelf["_state"]>
		? WithUpdate<TSelf>
		: TSelf["_err"]["updater"] {
		const { isReadonly, computation, updater } = this._config;

		if (isReadonly || isNotUndefined(computation) || isNotUndefined(updater))
			throw Error(this._err.updater);

		return this._factory({ isNullable: false, updater: valOrFn }) as never;
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
		TSelf extends AnyBaseColumnBuilder,
		const TIdxName extends string = `${TName}_unique_idx`,
	>(
		this: TSelf,
		name?: TIdxName,
	): true extends CanHaveUniqueIndex<TSelf["_state"]>
		? WithUnique<TSelf, TIdxName>
		: TSelf["_err"]["unique"] {
		if (this._config.isUniqueIndex) throw Error(this._err.unique);

		return this._factory({
			indexName: name ?? `${this._randName}_unique_idx`,
			isUniqueIndex: true,
		}) as never;
	}

	/** Validates inputs during inserts and updates.
	 *
	 * @param fns validator functions. Returns true if successful, false if unsuccessful, or a string for a custom error message
	 */
	validate<TSelf extends AnyBaseColumnBuilder>(
		this: TSelf,
		...fns: Array<
			(val: TSelf["_state"]["insertType"]) => Promisable<boolean | string>
		>
	): TSelf {
		return this._factory({ validator: fns }) as never;
	}
}

export class Column {}
