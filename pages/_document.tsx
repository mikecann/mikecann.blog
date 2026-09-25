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
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-7987945-1"></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-7987945-1');`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
