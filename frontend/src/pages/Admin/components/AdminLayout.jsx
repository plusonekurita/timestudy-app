import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  Group as GroupIcon,
} from "@mui/icons-material";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

import LoadingOverlay from "../../../components/LoadingOverlay";
import DashboardPage from "./DashboardPage";
import UserListPage from "./UserListPage";
import UserAddPage from "./UserAddPage";

const drawerWidth = 240;

const AdminLayout = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(
    <DashboardPage setLoading={setLoading} />
  );

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    {
      label: "ダッシュボード",
      icon: <DashboardIcon />,
      content: <DashboardPage setLoading={setLoading} />,
    },
    {
      label: "利用者追加",
      icon: <PersonAddAlt1Icon />,
      content: <UserAddPage setLoading={setLoading} />,
    },
    {
      label: "利用者一覧",
      icon: <GroupIcon />,
      content: <UserListPage setLoading={setLoading} />,
    },
    // {
    //   label: "設定",
    //   icon: <SettingsIcon />,
    //   content: <Typography sx={{ p: 2 }}>設定ページ</Typography>,
    // },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <LoadingOverlay loading={loading} />
      {/* 左メニュー */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : 60,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 60,
            transition: "width 0.3s",
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton onClick={toggleDrawer}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* 左アイコンリスト */}
        <List>
          {menuItems.map(({ label, icon, content }) => (
            <ListItem disablePadding key={label}>
              <ListItemButton onClick={() => setContent(content)}>
                <ListItemIcon>{icon}</ListItemIcon>
                {open && <ListItemText primary={label} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* メイン画面 */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Box>{content}</Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
