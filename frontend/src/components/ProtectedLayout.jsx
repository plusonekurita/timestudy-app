// src/components/ProtectedLayout
import AlignVerticalBottomIcon from "@mui/icons-material/AlignVerticalBottom";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTheme } from "@mui/material/styles"; // MUIのテーマを利用するためにインポート
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";

import Header from "./Header";

// ヘッダー、フッターの高さ
const HEADER_HEIGHT = "42px";
const FOOTER_HEIGHT = "68px";

const navItems = [
  { label: "計測", icon: <AccessTimeIcon />, path: "/main" },
  { label: "履歴", icon: <EventNoteIcon />, path: "/timeline" },
  { label: "統計", icon: <AlignVerticalBottomIcon />, path: "/records" },
  // { label: "その他", icon: <MoreHorizIcon />, path: "/main" },
];

const ProtectedLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const theme = useTheme(); // MUIのテーマオブジェクトを取得

  if (!isAuthenticated) {
    // 未認証ならログインページへリダイレクト
    return <Navigate to="/login" replace />;
  }

  const currentIndex = navItems.findIndex((item) =>
    location.pathname.startsWith(item.path)
  );
  const isAdminPage = location.pathname.startsWith("/admin");

  // 認証済み
  // 共通ヘッダーなどを配置できる
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* ヘッダーコンテナ */}
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

      {/* メイン */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // 残りの高さをすべて使用
          overflowY: "auto",
          pt: HEADER_HEIGHT, // 固定ヘッダーの高さ分だけ上部にパディングを設定
          pb: isAdminPage ? 0 : FOOTER_HEIGHT, // BottomNavigation の高さ分の余白
          width: "100%", // 幅を100%に
          // overflowY: 'auto', // 必要に応じてメインコンテンツエリアのみスクロールさせる場合
        }}
      >
        <Outlet /> {/* ここに各ページのコンテンツが表示されます */}
      </Box>

      {/* フッター ※管理画面は非表示 */}
      {!isAdminPage && (
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
  );
};

export default ProtectedLayout;
