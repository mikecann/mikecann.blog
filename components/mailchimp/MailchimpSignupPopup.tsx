import * as React from "react";
import Script from "next/script";

// Close controls injected by the Mailchimp popup / banner script
const closeSelector = '.mc-closeModal, [data-action="close-mc-modal"]';

const isVisible = (el: HTMLElement) => el.getClientRects().length > 0;

/**
 * The Mailchimp popup is injected by a third party script and its close control is a plain div, so
 * make it reachable and operable by keyboard and let Escape dismiss the popup.
 */
const useKeyboardDismissablePopup = () => {
  React.useEffect(() => {
    const enhanceCloseControls = () => {
      document.querySelectorAll<HTMLElement>(closeSelector).forEach((el) => {
        if (el.dataset.a11yEnhanced) return;
        el.dataset.a11yEnhanced = "true";
        if (!el.matches("button, a[href]")) {
          el.setAttribute("role", "button");
          el.tabIndex = 0;
          el.addEventListener("keydown", (e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            el.click();
          });
        }
        if (!el.getAttribute("aria-label") && !el.textContent?.trim())
          el.setAttribute("aria-label", "Close signup popup");
      });
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const close = Array.from(document.querySelectorAll<HTMLElement>(closeSelector)).find(
        isVisible,
      );
      if (!close) return;
      e.preventDefault();
      close.click();
    };

    enhanceCloseControls();
    const observer = new MutationObserver(enhanceCloseControls);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
};

export function MailchimpSignupPopup() {
  useKeyboardDismissablePopup();
  return (
    <Script id="mcjs">
      {`!function(c,h,i,m,p){m=c.createElement(h),p=c.getElementsByTagName(h)[0],m.async=1,m.src=i,p.parentNode.insertBefore(m,p)}(document,"script","https://chimpstatic.com/mcjs-connected/js/users/aaed03be8d4e6cc7ca902a572/9c9ed33ce17e8d28efd5e393e.js");`}
    </Script>
  );
}
