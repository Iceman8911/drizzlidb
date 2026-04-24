import { defineConfig } from "bunup";

export default defineConfig({
	dts: { inferTypes: true, resolve: true },
	entry: ["src/index.ts"],
	format: ["esm"],
	packages: "bundle",
});
