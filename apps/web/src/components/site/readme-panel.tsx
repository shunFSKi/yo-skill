/**
 * 源仓库 README 渲染（服务端组件，构建期 SSG，零客户端 JS）。
 * 安全口径：skipHtml 丢弃全部原始 HTML（徽章/排版块），无注入面。
 * 相对链接/图片重写到 GitHub 绝对地址，外链全部新窗口 + noreferrer。
 */

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function resolveLink(href: string | undefined, repo: string): string {
  if (!href) return "#";
  if (/^(https?:|mailto:|#)/i.test(href)) return href;
  const clean = href.replace(/^\.\//, "");
  return `https://github.com/${repo}/blob/HEAD/${clean}`;
}

function resolveImage(src: string | undefined, repo: string): string {
  if (!src) return "";
  if (/^(https?:|data:)/i.test(src)) return src;
  const clean = src.replace(/^\.\//, "");
  return `https://raw.githubusercontent.com/${repo}/HEAD/${clean}`;
}

export function ReadmePanel({
  markdown,
  repo,
}: {
  markdown: string;
  repo: string;
}) {
  return (
    <div className="yo-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        /* README 里的徽章/排版全是原始 HTML，直接丢弃（也是注入保险） */
        skipHtml
        components={{
          /* README 的 h1 多半是仓库名，降一级避免与详情页标题打架 */
          h1: ({ children }) => <h2>{children}</h2>,
          a: ({ href, children }) => (
            <a
              href={resolveLink(href, repo)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImage(src, repo)} alt={alt ?? ""} loading="lazy" />
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
