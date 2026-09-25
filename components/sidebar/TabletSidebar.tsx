import * as React from "react";
import { PageButton } from "./PageButton";
import { FaHome, FaTags, FaRssSquare } from "react-icons/fa";
import { HiArchive } from "react-icons/hi";
import { IoMdSearch, IoMdInformationCircle } from "react-icons/io";
import { SearchModal } from "../searchModal/SearchModal";
import { useState } from "react";
import { Background } from "./Background";
import { SocialIcons } from "./SocialIcons";
import { PiTreasureChestDuotone } from "react-icons/pi";
import { AvatarButton } from "./AvatarButton";
import { Grid, Vertical } from "../utils/gls";
import { VerticalSpacer } from "gls";

interface Props {}

export const TabletSidebar: React.FC<Props> = ({}) => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Background style={{ width: 200 }}>
        <AvatarButton size={120} bubbleProps={{ style: { fontSize: "2.8em" } }} />
        <VerticalSpacer space={20} />
        <div style={{ fontSize: "1.8em", fontWeight: "bold" }}>Mike Cann</div>
        <VerticalSpacer space={30} />
        <Grid style={{ padding: 10 }} justify="center" spacing={[10, 10]}>
          <SocialIcons />
        </Grid>
        <VerticalSpacer space={30} />
        <Vertical tag="nav" aria-label="Main" width="100%" horizontalAlign="center" spacing={20}>
          <PageButton icon={<FaHome />} label="Home" href="/" />
          <PageButton icon={<FaTags />} label="Tags" href="/tags" />
          <PageButton icon={<HiArchive />} label="Archive" href="/years" />
          <PageButton icon={<IoMdInformationCircle />} label="About" href="/about" />
          <PageButton icon={<FaRssSquare />} label="RSS" href="/rss.xml" />
          <PageButton icon={<IoMdSearch />} label="Search" onClick={() => setSearchVisible(true)} />
          <PageButton icon={<PiTreasureChestDuotone />} label="Stash" href="/stash" />
        </Vertical>
      </Background>
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};
