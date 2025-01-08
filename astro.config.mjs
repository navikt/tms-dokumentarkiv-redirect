import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  base: "/mine-saker", // The base path of your site. Useful for projects hosted under subpaths.
  output: "server",
  adapter: node({
    mode: "standalone",
  })
});
