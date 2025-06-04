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
import { onOpenMikebot } from "../mikebot/signals";
import { floatAnimation } from "../animations";
import { AvatarSpeechBubble } from "../mikebot/AvatarSpeechBubble";
import { Grid, Vertical } from "../utils/gls";
import { VerticalSpacer } from "gls";

interface Props {}

export const TabletSidebar: React.FC<Props> = ({}) => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Background style={{ width: 200 }}>
        <div
          onClick={() => onOpenMikebot.dispatch("")}
          style={{
            cursor: "pointer",
            position: "relative",
            animation: `${floatAnimation()} 6s ease-in-out infinite`,
          }}
        >
          <img
            alt={`profile picture of me mike cann`}
            style={{
              borderRadius: "50%",
              boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.6)",
            }}
            width={120}
            height={120}
            src="/images/me.jpg"
          />
          <AvatarSpeechBubble style={{ fontSize: "2.8em" }} />
        </div>
        <VerticalSpacer space={20} />
        <div style={{ fontSize: "1.8em", fontWeight: "bold" }}>Mike Cann</div>
        <VerticalSpacer space={30} />
        <Grid style={{ padding: 10 }} justify="center" spacing={[10, 10]}>
          <SocialIcons />
        </Grid>
        <VerticalSpacer space={30} />
        <Vertical width="100%" horizontalAlign="center" spacing={20}>
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
