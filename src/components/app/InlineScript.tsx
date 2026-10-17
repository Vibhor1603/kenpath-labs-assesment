/**
 * Runs synchronously during HTML parsing on full loads. On the client the tag
 * becomes inert text so React does not warn about rendering a script.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
