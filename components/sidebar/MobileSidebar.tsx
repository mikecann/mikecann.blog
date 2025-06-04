import * as React from "react";
import { SocialIcon } from "./SocialIcon";
import { AiOutlineGithub, AiOutlineTwitter, AiFillFacebook, AiFillLinkedin } from "react-icons/ai";
import { RiStackOverflowLine } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import { PageButton } from "./PageButton";
import { FaHome, FaTags, FaRssSquare } from "react-icons/fa";
import { BsFillCollectionFill } from "react-icons/bs";
import { HiArchive } from "react-icons/hi";
import { IoMdSearch, IoMdInformationCircle } from "react-icons/io";
import { SearchModal } from "../searchModal/SearchModal";
import { useState } from "react";
import { Background } from "./Background";
import Link from "next/link";
import { PiTreasureChestDuotone } from "react-icons/pi";
import { onOpenMikebot } from "../mikebot/signals";
import { AvatarSpeechBubble } from "../mikebot/AvatarSpeechBubble";
import { floatAnimation } from "../animations";
import { Vertical } from "../utils/gls";
import { VerticalSpacer } from "gls";

interface Props {}

export const MobileSidebar: React.FC<Props> = ({}) => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Background style={{ width: 60 }}>
        <div
          onClick={() => onOpenMikebot.dispatch("")}
          style={{
            cursor: "pointer",
            position: "relative",
            animation: `${floatAnimation(5)} 6s ease-in-out infinite`,
          }}
        >
          <img
            alt={`profile picture of me mike cann`}
            style={{
              borderRadius: "50%",
              boxShadow: "0 5px 15px 0px rgba(0, 0, 0, 0.6)",
            }}
            width={40}
            height={40}
            src="/images/me.jpg"
          />
          <AvatarSpeechBubble
            style={{ fontSize: "1.2em" }}
            strokeSize="1px"
            top="5px"
            left="-10px"
            floatAnimSize={5}
          />
        </div>
        <VerticalSpacer space={30} />
        <Vertical spacing={20} style={{ fontSize: "1.5em" }}>
          <PageButton icon={<FaHome />} href="/" />
          <PageButton icon={<FaTags />} href="/tags" />
          <PageButton icon={<HiArchive />} href="/years" />
          <PageButton icon={<IoMdInformationCircle />} href="/about" />
          <PageButton icon={<FaRssSquare />} href="/rss.xml" />
          <PageButton icon={<IoMdSearch />} onClick={() => setSearchVisible(true)} />
          <PageButton icon={<PiTreasureChestDuotone />} href="/stash" />
        </Vertical>
      </Background>
      {searchVisible && <SearchModal onClose={() => setSearchVisible(false)} />}
    </>
  );
};
