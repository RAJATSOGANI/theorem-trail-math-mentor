import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function MathMarkdown({ children }: { children: string }) {
  return (
    <div className="prose-math space-y-3 text-[15px] leading-relaxed [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-primary [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
