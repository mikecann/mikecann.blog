// The deep-import module declarations live in @types/react-syntax-highlighter.
/// <reference types="react-syntax-highlighter" />
import * as React from "react";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import darcula from "react-syntax-highlighter/dist/esm/styles/prism/darcula";
import actionscript from "react-syntax-highlighter/dist/esm/languages/prism/actionscript";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import glsl from "react-syntax-highlighter/dist/esm/languages/prism/glsl";
import haxe from "react-syntax-highlighter/dist/esm/languages/prism/haxe";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";

// Only the languages that posts actually use (from a scan of the ``` fences in public/posts).
// Registering a grammar also registers its aliases (ts, js, cs, html, ...). Fences in any other
// language still render as a styled block, just without highlighting.
SyntaxHighlighter.registerLanguage("actionscript", actionscript);
SyntaxHighlighter.registerLanguage("csharp", csharp);
SyntaxHighlighter.registerLanguage("glsl", glsl);
SyntaxHighlighter.registerLanguage("haxe", haxe);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("markup", markup);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("yaml", yaml);
SyntaxHighlighter.alias("actionscript", ["as3"]);

const customStyle: React.CSSProperties = { fontSize: "0.8em", borderRadius: 6, margin: "1em 0" };

interface Props {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<Props> = ({ code, language }) => (
  <SyntaxHighlighter language={language?.toLowerCase()} style={darcula} customStyle={customStyle}>
    {code}
  </SyntaxHighlighter>
);

export default CodeBlock;
