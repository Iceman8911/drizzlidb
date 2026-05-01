/** biome-ignore-all lint/suspicious/noExplicitAny: <Generics stuff> */
import type { IndexedDbBinaryType, Satisfies } from "../../shared/types";
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

interface UnionToBinary {
	arrayBuffer: ArrayBuffer;
	blob: Blob;
	file: File;
	uint8Array: Uint8Array;
}

type Binary = Satisfies<
	UnionToBinary[keyof UnionToBinary],
	IndexedDbBinaryType
>;

interface BinaryColumnGenerics extends BaseColumnGenerics {
	insertType: Binary;
	selectType: Binary;
	updateType: Binary;
}

type WithType<
	TBuilder extends BaseColumnBuilder,
	TType extends keyof UnionToBinary,
> = WithColumnBuilderState<
	TBuilder,
	{
		insertType: UnionToBinary[TType];
		selectType: UnionToBinary[TType];
		updateType: UnionToBinary[TType];
	}
>;

type DefaultBinaryColumnGenerics<TType extends Binary = Binary> = Satisfies<
	Omit<
		DefaultBaseColumnGenerics,
		"selectType" | "updateType" | "insertType"
	> & {
		selectType: TType;
		insertType: TType;
		updateType: TType;
	},
	BinaryColumnGenerics
>;

interface BinaryColumnBuilderConfig<
	TGenerics extends BinaryColumnGenerics = BinaryColumnGenerics,
> extends BaseColumnBuilderConfig<TGenerics> {}

const DEFAULT_BINARY_COLUMN_BUILDER_CONFIG = {
	...DEFAULT_COLUMN_BUILDER_CONFIG,
} as const satisfies BinaryColumnBuilderConfig;

class _BinaryColumnBuilder<
	const TName extends string = string,
	const TGenerics extends BinaryColumnGenerics = BinaryColumnGenerics,
> extends BaseColumnBuilder<TName, TGenerics> {
	declare readonly [PrivateProps.State]: TGenerics;
	override readonly [PrivateProps.Config]: BinaryColumnBuilderConfig<
		PrivateProps.GetState<this>
	>;

	constructor(
		name?: TName,
		config: BinaryColumnBuilderConfig<TGenerics> = clone(
			DEFAULT_BINARY_COLUMN_BUILDER_CONFIG,
		),
	) {
		super(name, config);

		this[PrivateProps.Config] = config;
	}

	/** Specify the specific kind of binary data.
	 *
	 * @param _type no runtime use. purely for type inference.
	 */
	type<TType extends keyof UnionToBinary, TSelf extends BaseColumnBuilder>(
		this: TSelf,
		_type: TType,
	): WithType<TSelf, TType> {
		return this as never;
	}
}

export const BinaryColumnBuilder = <
	const TName extends string,
	TType extends Binary,
>(
	name?: TName,
) => new _BinaryColumnBuilder<TName, DefaultBinaryColumnGenerics<TType>>(name);
