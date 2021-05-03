import * as esbuild from "esbuild-wasm";
import ReactDOM from "react-dom";
import { useState, useEffect, useRef } from "react";
import { UnpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const ref = useRef<any>();
  const iframe = useRef<any>();

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
      plugins: [UnpkgPathPlugin(), fetchPlugin(input)],
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
    });

    iframe.current.contentWindow.postMessage(result.outputFiles[0].text, "*");

    setCode(result.outputFiles[0].text);
  };

  const startService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: "https://www.unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm",
    });
  };

  const html = `
    <html>
      <head></head>
      <body>
          <div id="root"></div>
          <script>
            function displayMessage(evt) {
              eval(evt.data)
            }
          
            if (window.addEventListener) {
              // For standards-compliant web browsers
              window.addEventListener("message", displayMessage, false);
            }
        </script>
      </body>
    </html>
  `;

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

      <iframe allow="" ref={iframe} title="da iframe" srcDoc={html} />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector("#root"));
