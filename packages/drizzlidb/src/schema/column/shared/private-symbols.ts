import { LIBRARY_NAME } from "../../../shared/constants";
import type { BaseColumnBuilder } from "../base";

/** Due to limitations with regular private and protected properties in typescript as well as the need to introspect into internal state from type-transforming helpers, symbol keys are used instead for the column builder properties.
 *
 * NOTE: This has to be a typescript namespace since regular object props loose the `unique symbol` status :p
 *
 * @internal
 */
export namespace PrivateBaseColumnBuilderProps {
	export const getSymbolName = <TName extends string>(name: TName) =>
		`${LIBRARY_NAME}:columnBuilder:${name}` as const;

	/** Self-referencing constructor in the base builder class to always reference the right subclass */
	export const Ctor = Symbol(getSymbolName("ctor"));
	export type Ctor = typeof Ctor;

	/** Internal config */
	export const Config = Symbol(getSymbolName("config"));
	export type Config = typeof Config;

	/** Error messages */
	export const Err = Symbol(getSymbolName("err"));
	export type Err = typeof Err;
	/** Utility for getting the type-only const strings for better type-level error messages */
	export type GetErr<TBuilder extends BaseColumnBuilder> = TBuilder[typeof Err];

	/** Randomly genned name if needed */
	export const RandName = Symbol(getSymbolName("randName"));
	export type RandName = typeof RandName;

	/** Internal type-only state */
	export const State = Symbol(getSymbolName("state"));
	export type State = typeof State;
	/** Utility for getting the type-only state of a column builder instance */
	export type GetState<TBuilder extends BaseColumnBuilder> =
		TBuilder[typeof State];

	/** Internal factory method to reduce repetition */
	export const Factory = Symbol(getSymbolName("factory"));
	export type Factory = typeof Factory;
}
