import * as React from "react";
import { SocialIcon } from "./SocialIcon";
import { AiOutlineGithub, AiOutlineTwitter, AiFillFacebook, AiFillLinkedin } from "react-icons/ai";
import { RiStackOverflowLine } from "react-icons/ri";
import { MdEmail } from "react-icons/md";

interface Props {}

export const SocialIcons: React.FC<Props> = ({}) => {
  return (
    <>
      <SocialIcon href="https://github.com/mikecann" label="GitHub">
        <AiOutlineGithub />
      </SocialIcon>
      <SocialIcon href="https://stackoverflow.com/users/521097/mikeysee" label="Stack Overflow">
        <RiStackOverflowLine />
      </SocialIcon>
      <SocialIcon href="https://twitter.com/mikeysee" label="Twitter">
        <AiOutlineTwitter />
      </SocialIcon>
      <SocialIcon href="https://facebook.com/mikeysee" label="Facebook">
        <AiFillFacebook />
      </SocialIcon>
      <SocialIcon href="https://www.linkedin.com/in/mikecann/" label="LinkedIn">
        <AiFillLinkedin />
      </SocialIcon>
      <SocialIcon href="mailto:mike.cann@gmail.com" label="Email Mike">
        <MdEmail />
      </SocialIcon>
    </>
  );
};
