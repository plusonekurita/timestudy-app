import { Box, Typography, LinearProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

const FullscreenProgressBar = ({ loading }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    if (loading) {
      startTimeRef.current = Date.now();
      setProgress(0);
      setVisible(true);

      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return Math.min(prev + Math.random() * 10, 90);
        });
      }, 150);
    } else {
      setProgress(100);
      const elapsed = Date.now() - startTimeRef.current;
      const delay = Math.max(1000 - elapsed, 0); // 残り表示すべき時間

      timeoutId = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, delay);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [loading]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1300,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          width: "60%",
          maxWidth: 400,
          backgroundColor: "#fff",
          borderRadius: 2,
          padding: 3,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="body2"
          sx={{ mb: 1, textAlign: "center", fontWeight: "bold" }}
        >
          記録を読み込み中...
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>
    </Box>
  );
};

export default FullscreenProgressBar;
