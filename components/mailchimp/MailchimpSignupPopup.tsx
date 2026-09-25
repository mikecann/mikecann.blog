import * as React from "react";
import { style } from "typestyle";
import Script from "next/script";

interface Props {}

export function MailchimpSignupPopup() {
  return (
    <Script id="mcjs">
      {`!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/aaed03be8d4e6cc7ca902a572/9c9ed33ce17e8d28efd5e393e.js");`}
    </Script>
  );
}
