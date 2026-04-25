export type PromisfyMethodReturnType<TObj extends Record<string, unknown>> = {
	[K in keyof TObj]: TObj[K] extends (...args: unknown[]) => unknown
		? Promise<ReturnType<TObj[K]>>
		: TObj[K];
};

export type Satisfies<TNarrow extends TWide, TWide> = TNarrow;

export type IndexedDbCompatibleType =
	| number
	| string
	| boolean
	| null
	| bigint
	| Date
	| RegExp
	| ArrayBuffer
	| ArrayBufferView
	| DataView
	| Blob
	| File
	| IndexedDbCompatibleType[]
	| { [key: string]: IndexedDbCompatibleType }
	| Map<IndexedDbCompatibleType, IndexedDbCompatibleType>
	| Set<IndexedDbCompatibleType>;
