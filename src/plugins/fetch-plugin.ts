import * as esbuild from "esbuild-wasm";
import axios from "axios";

import localForage from "localforage";

const fileCache = localForage.createInstance({
  name: "fileCache",
});

export const fetchPlugin = (input: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      // when the path of the file is resolved by onResolve
      // then is taken by onLoad that try to load the content of the file
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);

        if (args.path === "index.js") {
          return {
            loader: "jsx",
            contents: input,
          };
        }

        // const dataStored = await fileCache.getItem<esbuild.OnLoadResult>(
        //   args.path
        // );

        // if (dataStored) return dataStored;

        // when axios call we have datas about the request too
        const { data, request } = await axios.get(args.path);

        // check if the file is a css file (.css extension)
        const isCss = args.path.match(/\.css$/) ? true : false;

        const escapedString = data
          .replace(/\n/g, "")
          .replace(/"/g, '/\\"/')
          .replace(/'/g, "/\\'/");

        // if is a css file we add a script to the bundle to append the css contents
        const contents = isCss
          ? `
          var styleNode = document.createElement('style');
          styleNode.innerHtml = '${escapedString}';
          document.getElementsByTagName('head')[0].appendChild(styleNode);
        `
          : data;

        // resolveDir is a parameter we can add that tells
        // where the files are actually stored
        // it's used to resolve an import path with a real path
        // in our case we take the response url from the previous request
        // because like that we can see if there is a redirection by unpkg
        const returnedData: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: contents,
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, returnedData);

        return returnedData;
      });
    },
  };
};
