import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localForage from "localforage";

const fileCache = localForage.createInstance({
  name: "fileCache",
});

export const UnpkgPathPlugin = (input: string) => {
  return {
    name: "unpkg-path-plugin",
    setup(build: esbuild.PluginBuild) {
      // the build as argument is the bundling process

      // the first file that is parsed is the entry point we give to the build function (in this case index.tsx)
      // then for every import in the file that he find he runs the same processes
      // onResolve: figuring out where the file is stored
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve", args);

        if (args.path === "index.tsx") {
          return { path: args.path, namespace: "a" };
        }

        if (args.path.includes("./") || args.path.includes("../")) {
          return {
            namespace: "a",
            path: new URL(
              args.path,
              "https://unpkg.com" + args.resolveDir + "/"
            ).href,
          };
        }

        return {
          path: `https://unpkg.com/${args.path}`,
          namespace: "a",
        };
      });

      // when the path of the file is resolved by onResolve
      // then is taken by onLoad that try to load the content of the file
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);

        if (args.path === "index.tsx") {
          return {
            loader: "jsx",
            contents: input,
          };
        }

        const dataStored = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (dataStored) return dataStored;

        // when axios call we have datas about the request too
        const { data, request } = await axios.get(args.path);

        // resolveDir is a parameter we can add that tells
        // where the files are actually stored
        // it's used to resolve an import path with a real path
        // in our case we take the response url from the previous request
        // because like that we can see in there was a redirection by unpkg
        const returnedData: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, returnedData);

        return returnedData;
      });
    },
  };
};
