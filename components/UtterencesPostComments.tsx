import * as React from "react";
import useScript from "../utils/useScript";

interface Props {}

export const UtterencesPostComments: React.FC<Props> = ({}) => {
  const comment = React.useRef<HTMLDivElement>(null);

  useScript({
    url: "https://utteranc.es/client.js",
    theme: "github-light",
    issueTerm: "og:title",
    label: "💬 comments",
    repo: "mikecann/mikecann.blog",
    ref: comment,
  });

  return <div ref={comment}></div>;
};
