import { Horizontal, Vertical } from "../../components/utils/gls";
import * as React from "react";
import Link from "next/link";
import type { SearchHit } from "../../utils/algolia";
import { formatUTCDate } from "../../utils/dates";
import { assetUrl } from "../../utils/assets";

/**
 * The index has stored cover images relative to the post (`./header.jpg`); newer indexes store
 * root paths. Resolve either to a URL the browser can load.
 */
export const getSearchHitImageUrl = ({
  coverImage,
  slug,
}: Pick<SearchHit, "coverImage" | "slug">) => {
  if (!coverImage) return "/images/fallback-post-header.jpg";
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(coverImage)) return coverImage;
  if (coverImage.startsWith("/")) return assetUrl(coverImage);
  return assetUrl(`/posts/${slug}/${coverImage.replace(/^\.\//, "")}`);
};

export function SearchResult({ hit, onClick }: { hit: SearchHit; onClick?: () => any }) {
  const { createdAt, title, slug } = hit;
  const [isOver, setIsOver] = React.useState(false);
  return (
    <Link href={`/posts/${slug}`} onClick={onClick}>
      <Horizontal
        spacing={10}
        width="100%"
        onMouseOver={() => setIsOver(true)}
        onMouseLeave={() => setIsOver(false)}
        style={{
          overflowX: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={`${title} post cover image`}
          src={getSearchHitImageUrl(hit)}
          width={100}
          height={60}
          loading="lazy"
          decoding="async"
          style={{
            objectFit: "cover",
            borderRadius: 6,
            opacity: isOver ? 1 : 0.7,
            transition: "all 0.1s linear",
          }}
        />
        <Vertical
          verticalAlign="center"
          spacing={5}
          style={{ width: "calc(100% - 140px)", overflow: "hidden" }}
        >
          <div style={{ margin: 0 }}>{title}</div>
          <div style={{ color: "#767676", fontSize: "0.8em" }}>{formatUTCDate(createdAt)}</div>
        </Vertical>
      </Horizontal>
    </Link>
  );
}
