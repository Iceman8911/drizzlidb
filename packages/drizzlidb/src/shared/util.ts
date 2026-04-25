export const getRandomUuid = (): ReturnType<typeof crypto.randomUUID> =>
	crypto.randomUUID();

export const clone = <T>(val: T): T => structuredClone(val);

export const isNotUndefined = (val: unknown): boolean => val !== undefined;
