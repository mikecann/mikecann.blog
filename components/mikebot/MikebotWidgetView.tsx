"use client";
import { Grid, Horizontal } from "../../components/utils/gls";
import * as React from "react";
import { style } from "typestyle";
import { MessageRow } from "./messages/MessageRow";
import { MessageEntryBox } from "./MessageEntryBox";
import { useMe } from "./MikebotMeProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect } from "react";
import { MessagesList } from "./MessagesList";
import { useQueryWithStatus } from "./helpers";
import { AiOutlineClear } from "react-icons/ai";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { mirage } from "ldrs";
import { LuMaximize2, LuMinimize2 } from "react-icons/lu";
import { useState } from "react";
import { MdOutlineHelpOutline } from "react-icons/md";

interface Props {
  onMinimize: () => void;
  initialMessage?: string | null;
}

mirage.register();

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

const currentThreadIdStorageKey = "mikebot2_current_thread_id";

export const MikebotWidgetView: React.FC<Props> = ({ onMinimize, initialMessage }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentThreadId, setCurrentThreadId] = React.useState<string | null>(
    () => localStorage[currentThreadIdStorageKey],
  );
  const me = useMe();

  const createThread = useMutation(api.mikebot.mutations.createThreadForUser);

  const threadQuery = useQueryWithStatus(
    api.mikebot.queries.findThreadForUser,
    currentThreadId && me ? { threadId: currentThreadId, userId: me._id } : "skip",
  );

  useEffect(() => {
    if (!me) return;

    if (currentThreadId) {
      if (threadQuery.data) return;
      if (threadQuery.status == "pending") return;
      setCurrentThreadId(null);
      return;
    }

    createThread({ userId: me._id })
      .then((id) => {
        localStorage[currentThreadIdStorageKey] = id;
        setCurrentThreadId(id);
      })
      .catch(console.error);
  }, [currentThreadId, me, threadQuery.data?._id, threadQuery.status]);

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
                if (!confirm("Are you sure you want to clear this thread?")) return;
                localStorage.removeItem(currentThreadIdStorageKey);
                setCurrentThreadId(null);
              }}
              aria-label="Delete thread"
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            borderBottom: "1px solid #eee",
            height: "max(50vh, 300px)",
          }}
        >
          {threadQuery.data && me ? (
            <MessagesList threadId={threadQuery.data._id} userId={me._id} />
          ) : (
            <Horizontal
              style={{
                height: "100%",
              }}
              horizontalAlign="center"
              verticalAlign="center"
            >
              {/* @ts-ignore */}
              <l-mirage size={80} color="#a0a0a0" />
            </Horizontal>
          )}
        </div>
        <MessageEntryBox
          userId={me?._id}
          threadId={threadQuery.data?._id}
          defaultMessage={initialMessage}
        />
      </div>
    </>
  );
};
