import { LIBRARY_NAME } from "../../../shared/constants";
import type { AnyBaseColumnBuilder } from "../base";

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

	/** Internal config */
	export const Config = Symbol(getSymbolName("config"));

	/** Error messages */
	export const Err = Symbol(getSymbolName("err"));
	/** Utility for getting the type-only const strings for better type-level error messages */
	export type GetErr<TBuilder extends AnyBaseColumnBuilder> =
		TBuilder[typeof Err];

	/** Randomly genned name if needed */
	export const RandName = Symbol(getSymbolName("randName"));

	/** Internal type-only state */
	export const State = Symbol(getSymbolName("state"));
	/** Utility for getting the type-only state of a column builder instance */
	export type GetState<TBuilder extends AnyBaseColumnBuilder> =
		TBuilder[typeof State];

	/** Internal factory method to reduce repetition */
	export const Factory = Symbol(getSymbolName("factory"));
}
