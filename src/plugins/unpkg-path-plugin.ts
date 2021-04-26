import * as esbuild from "esbuild-wasm";

export const UnpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // the build as argument is the bundling process

      // the first file that is parsed is the entry point we give to the build function (in this case index.tsx)
      // then for every import in the file that he find he runs the same processes
      // onResolve: figuring out where the file is stored
      build.onResolve({ filter: /^index\.js$/ }, (args: any) => {
        return { path: "index.js", namespace: "a" };
      });

      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: "a",
          path: new URL(args.path, "https://unpkg.com" + args.resolveDir + "/")
            .href,
        };
      });

      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: "a",
        };
      });
    },
  };
};
