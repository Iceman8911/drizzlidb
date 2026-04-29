export type PromisfyMethodReturnType<TObj extends Record<string, unknown>> = {
	[K in keyof TObj]: TObj[K] extends (...args: unknown[]) => unknown
		? Promise<ReturnType<TObj[K]>>
		: TObj[K];
};

export type Satisfies<TNarrow extends TWide, TWide> = TNarrow;

export type IndexedDbPrimitiveType = number | string | boolean | null | bigint;

export type IndexedDbBinaryType = ArrayBuffer | Uint8Array | Blob | File;

// TODO: Export this in an entrypoint
export type IndexedDbJsonType =
	| IndexedDbPrimitiveType
	| IndexedDbJsonType[]
	| { [key: string]: IndexedDbJsonType | IndexedDbJsonType[] };

// TODO: Export this in an entrypoint
export type IndexedDbCompatibleType =
	| IndexedDbPrimitiveType
	| Date
	| RegExp
	| IndexedDbBinaryType
	| IndexedDbCompatibleType[]
	| IndexedDbJsonType
	| { [key: string]: IndexedDbCompatibleType }
	| Map<IndexedDbCompatibleType, IndexedDbCompatibleType>
	| Set<IndexedDbCompatibleType>;
