import * as esbuild from "esbuild-wasm";
import ReactDOM from "react-dom";
import { useState, useEffect, useRef } from "react";
import { UnpkgPathPlugin } from "./plugins/unpkg-path-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const ref = useRef<any>();

  const onClick = async () => {
    if (!ref.current) return;

    // transform is for transpile content only :)
    //
    /* const results = await ref.current.transform(input, {
      loader: "jsx",
      target: "es2015",
    }); */

    const result = await ref.current.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [UnpkgPathPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    setCode(result.outputFiles[0].text);
  };

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "/esbuild.wasm",
    });
  };

  useEffect(() => {
    startService();
  }, []);

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <button onClick={onClick}>Submit</button>

      <pre>{code}</pre>
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
