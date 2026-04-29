import type { BaseColumnBuilder } from "./column/base";

// TODO: retun a typescript error if more than 1 column is set to a primary key
// TODO: Support compound indexes
// TODO: Support sharding (i.e. `users` will be stored as `users_1`, `users_2`, etc)
export class Table<
	const TName extends string,
	const TColumns extends Record<string, BaseColumnBuilder>,
> {
	/** Compile-time only property to prevent repeating unnecessarily, since types can't really be declared directly in a class body */
	declare _type: Table<TName, TColumns>;

	readonly #version: number = 1;

	constructor(
		public readonly name: TName,
		public readonly columns: TColumns,
	) {}

	async export() {}

	async import() {}

	/** Lazy intialization of a table.
	 *
	 * @returns the same table instance
	 */
	async init(): Promise<typeof this._type> {
		return this;
	}

	/** Chainable migrations.
	 *
	 * @returns a new table instance
	 */
	migrate(): typeof this._type {
		return this;
	}
}

const a = new Table("Bob", {});
