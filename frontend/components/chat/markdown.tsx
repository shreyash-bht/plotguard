"use client";

import Gfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

/**
 * Markdown renderer for assistant answers, hand-styled with Tailwind (no
 * typography plugin dependency). LLM output stays untrusted as far as CSS is
 * concerned: no `dangerouslySetInnerHTML`, no html components allowed.
 */
export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[Gfm]}
      components={{
        p: ({ children }) => (
          <p className="text-[14.5px] leading-relaxed text-zinc-200 [&:not(:first-child)]:mt-3">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-zinc-200">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-zinc-200">
            {children}
          </ol>
        ),
        h1: ({ children }) => (
          <h3 className="mt-4 text-base font-semibold text-zinc-100">{children}</h3>
        ),
        h2: ({ children }) => (
          <h3 className="mt-4 text-base font-semibold text-zinc-100">{children}</h3>
        ),
        h3: ({ children }) => (
          <h3 className="mt-4 text-[15px] font-semibold text-zinc-100">{children}</h3>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-zinc-100">{children}</strong>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-3 border-l-2 border-line-strong pl-3 text-[14px] text-mute italic">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-4 border-line" />,
        table: ({ children }) => (
          <div className="my-3 overflow-x-auto rounded-lg border border-line">
            <table className="w-full text-[13px] text-zinc-200">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border-b border-line bg-raise px-3 py-1.5 text-left font-medium text-zinc-100">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-line/50 px-3 py-1.5 align-top">{children}</td>
        ),
        code: ({ className, children }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed text-zinc-200">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[12.5px] text-violet-200">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-3 overflow-hidden rounded-xl border border-line bg-raise">
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
