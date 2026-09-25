"use client";
import { Horizontal } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { useMe } from "./MikebotMeProvider";
import { useEffect } from "react";
import { AiOutlineClear } from "react-icons/ai";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";
import { useState } from "react";
import { MdOutlineHelpOutline } from "react-icons/md";
import { useMikebotThread } from "./useMikebotThread";
import { MikebotConversation } from "./MikebotConversation";

interface Props {
  onMinimize: () => void;
  initialMessage?: string | null;
}

const windowStyle = style({
  display: "flex",
  flexDirection: "column",
  border: "1px solid #b9b8b8",
  borderRadius: "6px",
  background: "rgba(255,255,255,1)",
  boxShadow: "0 5px 10px 0px rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(8px)",
  position: "fixed",
  right: "10px",
  bottom: "10px",
  width: "320px",
  zIndex: 30,
  transition: "all 0.2s ease",
  transformOrigin: "bottom right",
  pointerEvents: "initial",
});

const iconButtonStyle = style({
  opacity: 0.6,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "20px",
  padding: "5px",
  display: "flex",
  flexDirection: "column",
  $nest: {
    "&:hover": {
      opacity: 1,
    },
  },
});

const overlayStyle = style({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  zIndex: 20,
  pointerEvents: "initial",
});

const errorBannerStyle: React.CSSProperties = {
  margin: "8px",
  padding: "8px",
  borderRadius: "4px",
  background: "#fdecea",
  color: "#8a1c1c",
  fontSize: "0.85em",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};

export const MikebotWidgetView: React.FC<Props> = ({ onMinimize, initialMessage }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const me = useMe();
  const token = me.status === "ready" ? me.token : null;
  const thread = useMikebotThread(token);

  const error =
    me.status === "error"
      ? { message: me.message, retry: me.retry }
      : thread.error
        ? { message: thread.error, retry: thread.clearError }
        : null;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isMaximized) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMaximized]);

  return (
    <>
      {isMaximized && <div className={overlayStyle} onClick={() => setIsMaximized(false)} />}
      <div
        className={windowStyle}
        style={{
          transform: isVisible ? "scale(1)" : "scale(0)",
          height: isVisible ? "auto" : "0",
          top: isMaximized ? "20px" : undefined,
          right: isMaximized ? "20px" : "10px",
          bottom: isMaximized ? "20px" : "10px",
          left: isMaximized ? "20px" : undefined,
          width: isMaximized ? "calc(100% - 40px)" : "320px",
          maxWidth: isMaximized ? "500px" : undefined,
          margin: isMaximized ? "0 auto" : undefined,
        }}
      >
        <div
          style={{
            height: "40px",
            background: "#ddd",
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
            fontWeight: "bold",
            flexShrink: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
          }}
        >
          <img
            alt={`profile picture of me mike cann`}
            style={{
              borderRadius: "50%",
              boxShadow: "0 0px 0px 2px rgba(255, 255, 255, 1), 0 3px 3px 0px rgba(0, 0, 0, 0.6)",
              position: "absolute",
              top: "20px",
              left: "15px",
              zIndex: 1,
              transform: "translate(-50%, -50%)",
            }}
            width={55}
            height={55}
            src="/images/mikebot.jpg"
          />
          <div style={{ marginLeft: "45px" }}>Mikebot</div>
          <Horizontal verticalAlign="center">
            <button
              onClick={() => {
                window.open("/posts/mikebot-the-virtual-me", "_blank");
              }}
              className={iconButtonStyle}
              aria-label="Learn more about Mikebot"
              title="Learn more about Mikebot"
              style={{ marginRight: 4 }}
            >
              <MdOutlineHelpOutline />
            </button>
            <button
              onClick={() => {
                if (!thread.threadId || thread.isDeleting) return;
                if (!confirm("Are you sure you want to delete this conversation?")) return;
                void thread.deleteThread();
              }}
              aria-label="Delete thread"
              title="Delete this conversation"
              disabled={!thread.threadId || thread.isDeleting}
              className={iconButtonStyle}
            >
              <AiOutlineClear />
            </button>
            <button
              aria-label={isMaximized ? "Restore" : "Maximize"}
              className={iconButtonStyle}
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <LuMinimize2 /> : <LuMaximize2 />}
            </button>

            {isMaximized ? null : (
              <button aria-label="Minimize" className={iconButtonStyle} onClick={onMinimize}>
                <MdOutlineKeyboardArrowDown />
              </button>
            )}
          </Horizontal>
        </div>
        {error ? (
          <div role="alert" style={errorBannerStyle}>
            <span>{error.message}</span>
            <button
              onClick={error.retry}
              style={{
                border: "none",
                background: "none",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Try again
            </button>
          </div>
        ) : null}
        <MikebotConversation
          token={token}
          threadId={thread.threadId}
          initialMessage={initialMessage}
        />
      </div>
    </>
  );
};
