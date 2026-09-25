import * as React from "react";
import { PageButton } from "./PageButton";
import { FaHome, FaTags, FaRssSquare } from "react-icons/fa";
import { HiArchive } from "react-icons/hi";
import { IoMdSearch, IoMdInformationCircle } from "react-icons/io";
import { SearchModal } from "../searchModal/SearchModal";
import { useState } from "react";
import { Background } from "./Background";
import { PiTreasureChestDuotone } from "react-icons/pi";
import { AvatarButton } from "./AvatarButton";
import { Vertical } from "../utils/gls";
import { VerticalSpacer } from "gls";

interface Props {}

export const MobileSidebar: React.FC<Props> = ({}) => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Background style={{ width: 60 }}>
        <AvatarButton
          size={40}
          floatAnimSize={5}
          bubbleProps={{
            style: { fontSize: "1.2em" },
            strokeSize: "1px",
            top: "5px",
            left: "-10px",
            floatAnimSize: 5,
          }}
        />
        <VerticalSpacer space={30} />
        <Vertical tag="nav" aria-label="Main" spacing={20} style={{ fontSize: "1.5em" }}>
          <PageButton icon={<FaHome />} ariaLabel="Home" href="/" />
          <PageButton icon={<FaTags />} ariaLabel="Tags" href="/tags" />
          <PageButton icon={<HiArchive />} ariaLabel="Archive" href="/years" />
          <PageButton icon={<IoMdInformationCircle />} ariaLabel="About" href="/about" />
          <PageButton icon={<FaRssSquare />} ariaLabel="RSS feed" href="/rss.xml" />
          <PageButton
            icon={<IoMdSearch />}
            ariaLabel="Search"
            onClick={() => setSearchVisible(true)}
          />
          <PageButton icon={<PiTreasureChestDuotone />} ariaLabel="Stash" href="/stash" />
        </Vertical>
      </Background>
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};
