import * as React from "react";
import { PageButton } from "./PageButton";
import { FaHome, FaTags, FaRssSquare } from "react-icons/fa";
import { HiArchive } from "react-icons/hi";
import { IoMdSearch, IoMdInformationCircle } from "react-icons/io";
import { PiTreasureChestDuotone } from "react-icons/pi";
import { SearchModal } from "../searchModal/SearchModal";
import { useState } from "react";
import { Background } from "./Background";
import { SocialIcons } from "./SocialIcons";
import Link from "next/link";
import { onOpenMikebot } from "../mikebot/signals";
import { AvatarSpeechBubble } from "../mikebot/AvatarSpeechBubble";
import { floatAnimation } from "../animations";
import { Grid, Horizontal } from "../utils/gls";
import { VerticalSpacer } from "gls";

interface Props {}

export const DesktopSidebar: React.FC<Props> = ({}) => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Background>
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
            width={125}
            height={125}
            src="/images/me.jpg"
          />
          <AvatarSpeechBubble style={{ fontSize: "3em" }} />
        </div>
        <VerticalSpacer space={20} />
        <div style={{ fontSize: "1.8em", fontWeight: "bold" }}>Mike Cann</div>
        <VerticalSpacer space={30} />
        <div>A professional software developer that just cant stop tinkering with things</div>
        <VerticalSpacer space={30} />
        <Horizontal spacing={10}>
          <SocialIcons />
        </Horizontal>
        <VerticalSpacer space={30} />
        <Grid width={300} justify="center" cols={2} colSpan={2} spacing={[30, 40]}>
          <PageButton icon={<FaHome />} label="Home" href="/" />
          <PageButton icon={<FaTags />} label="Tags" href="/tags" />
          <PageButton icon={<HiArchive />} label="Archive" href="/years" />
          <PageButton icon={<IoMdInformationCircle />} label="About" href="/about" />
          <PageButton icon={<FaRssSquare />} label="RSS" href="/rss.xml" />
          <PageButton icon={<IoMdSearch />} label="Search" onClick={() => setSearchVisible(true)} />
          <PageButton icon={<PiTreasureChestDuotone />} label="Stash" href="/stash" />
        </Grid>
      </Background>
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};
