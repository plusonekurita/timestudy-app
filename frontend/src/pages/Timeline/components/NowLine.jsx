// components/NowLine.jsx
import React, { useEffect } from "react";
import { Box } from "@mui/material";

const NowLine = ({
  nowTop,
  hourHeights,
  hasScrolledToNow,
  refObj,
  setHasScrolledToNow,
}) => {
  useEffect(() => {
    if (
      nowTop !== null &&
      refObj.current &&
      !hasScrolledToNow &&
      hourHeights.length === 24
    ) {
      const container = refObj.current;

      // 現在の時間（hour）を取得
      const now = new Date();
      const nowHour = now.getHours();
      const currentHourHeight = hourHeights[nowHour] || 0;

      // スクロールターゲット位置を補正
      const scrollTarget =
        nowTop - container.clientHeight / 2 - currentHourHeight / 2;

      container.scrollTo({
        top: Math.max(
          0,
          Math.min(
            scrollTarget,
            container.scrollHeight - container.clientHeight
          )
        ),
        behavior: "smooth",
      });

      setHasScrolledToNow(true);
    }
  }, [nowTop, hasScrolledToNow, refObj, setHasScrolledToNow, hourHeights]);

  return (
    <Box
      sx={{
        position: "absolute",
        top: nowTop,
        left: 0,
        right: 0,
        height: "2px",
        backgroundColor: "red",
        zIndex: 10,
        opacity: 0.7,
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "red",
          ml: "52px",
          boxShadow: "0 0 2px rgba(0,0,0,0.2)",
        }}
      />
    </Box>
  );
};

export default NowLine;
