import { BottomNavigation, BottomNavigationAction, Drawer, IconButton, } from "@mui/material";
// src/components/ProtectedLayout.jsx
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

import { TIME_NAV, SHEET_NAV } from "../constants/navigation";
import LeftDrawerMenu from "./LeftDrawerMenu/LfetDrawerMenu";
import LoadingOverlay from "./LoadingOverlay";
import EdgeMenuHandle from "./EdgeMenuHandle";
import Header from "./Header";


const HEADER_HEIGHT = "42px";
const FOOTER_HEIGHT = "68px";

/** Drawer 幅は LeftDrawerMenu.scss の width と合わせる */
const DRAWER_WIDTH = 260;

const ProtectedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  // state
  const [drawerOpen, setDrawerOpen] = useState(false);
  // store
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { loading } = useSelector((state) => state.loading);

  // スマホかｐｃかチェック
  const isMobile = useMediaQuery("(max-width:600px)");
  const isPhoneWidth = useMediaQuery("(max-width:600px)");
  const isTouchOnly = useMediaQuery("(hover: none) and (pointer: coarse)");
  const isMobileDevice = isPhoneWidth && isTouchOnly;

  const isNarrow = useMediaQuery("(max-width:1000px)"); // <1000px

  // ナビ配列の構築（既存）
  const navItems = [];
  if (location.pathname.startsWith("/time")) {
    navItems.push(...TIME_NAV);
  } else if (location.pathname.startsWith("/sheetList")) {
    navItems.push(...SHEET_NAV);
  }

  const currentIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );
  const isAdminPage = location.pathname.startsWith("/admin");
  const isMenuPage = location.pathname.startsWith("/menu");

  const drawerVariant = isNarrow ? "temporary" : "persistent";
  const showDrawer = !isMobileDevice && !isAdminPage; // スマホ＆管理画面では Drawer 自体を出さない
  const closeDrawer = () => setDrawerOpen(false);

  // 画面幅/ページ種別で初期状態切替
  useEffect(() => {
    if (isMobileDevice || isAdminPage) {
      // スマホと管理画面では左メニューは使わない
      setDrawerOpen(false);
    } else {
      // PCは開く、タブレットは閉じる
      setDrawerOpen(!isNarrow);
    }
  }, [isMobileDevice, isNarrow, isAdminPage]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* ← 既存の「デスクトップ用ドロワー直置き」は削除 */}

      {/* 既存のローディング */}
      <LoadingOverlay loading={loading} />

      {/* 既存のヘッダー（モバイル or 管理画面のみ固定表示） */}
      {(isMobileDevice || isAdminPage) && (
        <Box
          component="header"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: HEADER_HEIGHT,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[1],
            zIndex: theme.zIndex.appBar,
          }}
        >
          <Header />
        </Box>
      )}

      {/* 左ドロワー（スマホ＆管理画面では無し） */}
      {showDrawer && (
        <Drawer
          variant={drawerVariant}
          open={drawerOpen}
          onClose={closeDrawer} // temporary 時に有効
          ModalProps={{ keepMounted: true }} // パフォーマンス
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              borderRight: "1px solid rgba(0,0,0,0.06)",
              overflowX: "hidden",
            },
          }}
        >
          <LeftDrawerMenu isAdmin={false} />
        </Drawer>
      )}
      {/* 左メニュー開閉ボタン */}
      <EdgeMenuHandle
        open={drawerOpen}
        drawerWidth={DRAWER_WIDTH}
        isNarrow={isNarrow}
        visible={showDrawer} // スマホ＆管理画面では出さない
        onToggle={() => setDrawerOpen((v) => !v)}
      />

      {/* メイン */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          ml: showDrawer && !isNarrow && drawerOpen ? `${DRAWER_WIDTH}px` : 0,
          pt: isMobileDevice || isAdminPage ? HEADER_HEIGHT : 0,
          pb: !isMobileDevice ? 0 : FOOTER_HEIGHT,
          width: "100%",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>

      {/* 既存のフッター（条件はそのまま） */}
      {isMobile && !isAdminPage && !isMenuPage && (
        <BottomNavigation
          showLabels
          value={currentIndex}
          onChange={(_e, newValue) => navigate(navItems[newValue].path)}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: FOOTER_HEIGHT,
            borderTop: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.appBar,
          }}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
};

export default ProtectedLayout;
