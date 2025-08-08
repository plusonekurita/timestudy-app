// src/components/ProtectedLayout
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

import { TIME_NAV, SHEET_NAV } from "../constants/navigation";
import LeftDrawerMenu from "./LeftDrawerMenu/LfetDrawerMenu";
import LoadingOverlay from "./LoadingOverlay";
import Header from "./Header";

// ヘッダー、フッターの高さ
const HEADER_HEIGHT = "42px";
const FOOTER_HEIGHT = "68px";

const ProtectedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { loading } = useSelector((state) => state.loading);
  const theme = useTheme(); // MUIのテーマオブジェクトを取得

  // 選択したメニューに応じてナビメニューを切り替える処理を実装
  const navItems = [];

  if (location.pathname.startsWith("/time")) {
    navItems.push(...TIME_NAV);
  } else if (location.pathname.startsWith("/sheetList")) {
    navItems.push(...SHEET_NAV);
  }

  if (!isAuthenticated) {
    // 未認証ならログインページへリダイレクト
    return <Navigate to="/login" replace />;
  }

  const currentIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );
  const isAdminPage = location.pathname.startsWith("/admin");
  const isMenuPage = location.pathname.startsWith("/menu");

  // 認証済み
  // 共通ヘッダーなどを配置できる
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* デスクトップ用ドロワーメニュー */}
      {!isMobile && !isAdminPage && (
        <div style={{ flexShrink: 0, overflow: "hidden" }}>
          <LeftDrawerMenu isAdmin={false} />
        </div>
      )}

      <LoadingOverlay loading={loading} />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          // minHeight: "100vh",
          // flexGrow: 1,
          flex: 1, // おかしい場合は戻す
        }}
      >
        {/* ヘッダーコンテナ */}
        {(isMobile || isAdminPage) && (
          <Box
            component="header"
            sx={{
              position: "fixed", // ヘッダーを固定
              top: 0,
              left: 0,
              right: 0, // 幅を100%にするため left と right を 0 に
              height: HEADER_HEIGHT, // ヘッダーの高さを指定
              backgroundColor: theme.palette.background.paper, // ヘッダーの背景色 (テーマから取得)
              boxShadow: theme.shadows[1], // ヘッダーに影を適用 (テーマから取得)
              zIndex: theme.zIndex.appBar, // 他の要素より手前に表示 (MUIのAppBarと同じz-index)
            }}
          >
            <Header />
          </Box>
        )}

        {/* メイン */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, // 残りの高さをすべて使用
            overflowY: "auto",
            pt: !isMobile ? 0 : HEADER_HEIGHT, // 固定ヘッダーの高さ分だけ上部にパディングを設定
            pb: isAdminPage || !isMobile ? 0 : FOOTER_HEIGHT, // BottomNavigation の高さ分の余白
            width: "100%", // 幅を100%に
          }}
        >
          <Outlet /> {/* ここに各ページのコンテンツが表示される */}
        </Box>

        {/* フッター ※管理画面とトップメニューでは非表示 */}
        {isMobile && !isAdminPage && !isMenuPage && (
          <BottomNavigation
            showLabels
            value={currentIndex}
            onChange={(event, newValue) => navigate(navItems[newValue].path)}
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
    </Box>
  );
};

export default ProtectedLayout;
