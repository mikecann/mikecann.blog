import Document, { Html, Head, Main, NextScript } from "next/document";
import { getStyles } from "typestyle";
import type { JSX } from "react";

export default class extends Document {
  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link
            rel="alternate"
            type="application/rss+xml"
            title="RSS feed for blog posts"
            href="https://mikecann.blog/rss.xml"
          />
          <style
            id="styles-target"
            dangerouslySetInnerHTML={{
              __html: getStyles(),
            }}
          ></style>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
