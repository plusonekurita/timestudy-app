import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { Box, IconButton, Tooltip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React from "react";

const HANDLE_W_SIZE = 25; // 取っ手の幅
const HANDLE_H_SIZE = 52; // 取っ手の高さ

export default function EdgeMenuHandle({
  open,
  drawerWidth,
  isNarrow, // 1000px以上かどうか
  visible, // モバイル版か
  onToggle,
}) {
  if (!visible || !isNarrow) return null;

  return (
    <Box
      data-testid="edge-menu-handle"
      sx={{
        position: "fixed",
        top: "10%",
        left: 0,
        zIndex: (t) => t.zIndex.drawer + 1,
        transform: open ? `translateX(${drawerWidth}px)` : "translateX(0)",
        transition: "transform 240ms cubic-bezier(0.4, 0, 0.2, 1)",
        width: HANDLE_W_SIZE,
        height: HANDLE_H_SIZE,
        border: "2px solid rgba(51, 51, 50, 0.78)",
        bgcolor: "rgba(255, 255, 255, 0.78)",
        color: "rgba(51, 51, 50, 0.78)",
        borderTopRightRadius: 7,
        borderBottomRightRadius: 7,
        boxShadow: 3,
        display: "flex",
        justifyContent: "center",
        ml: open ? 0 : "-2px",
        overflow: "hidden",
        pointerEvents: "auto",
        cursor: "pointer",
      }}
    >
      <Tooltip title={open ? "閉じる" : "メニュー"} placement="right">
        <IconButton
          onClick={onToggle}
          size="small"
          sx={{
            color: "inherit",
            "&:hover": { bgcolor: "rgba(234, 234, 234, 0.08)" },
            "&:focus": { outline: "none" },
            pointerEvents: "auto",
          }}
          aria-label="toggle menu"
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
