import * as esbuild from "esbuild-wasm";
import ReactDOM from "react-dom";
import { useState, useEffect, useRef } from "react";

const App = () => {
  const [input, setInput] = useState("");
  const [code, setCode] = useState("");
  const ref = useRef<any>();

  const onClick = async () => {
    if (!ref.current) return;

    const results = await ref.current.transform(input, {
      loader: "jsx",
      target: "es2015",
    });

    setCode(results.code);
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
