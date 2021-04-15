import * as esbuild from "esbuild-wasm";

export const UnpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // the build as argument is the bundling process

      // the first file that is parsed is the entry point we give to the build function (in this case index.tsx)
      // then for every import in the file that he find it runs the same processes
      // onResolve: figuring out where the file is stored
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve", args);
        return { path: args.path, namespace: "a" };
      });

      // when the path of the file is resolved by onResolve
      // then is taken by onLoad that try to load the content of the file
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);

        if (args.path === "index.tsx") {
          return {
            loader: "jsx",
            contents: `
              import message from './message';
              console.log(message);
            `,
          };
        } else {
          return {
            loader: "jsx",
            contents: 'export default "hi there!"',
          };
        }
      });
    },
  };
};
