export const getRandomUuid = (): ReturnType<typeof crypto.randomUUID> =>
	crypto.randomUUID();

export const clone = <T>(val: T, deep = false): T =>
	deep ? structuredClone(val) : { ...val };

export const isNotUndefined = <T>(val: T): val is NonNullable<T> =>
	val !== undefined;
