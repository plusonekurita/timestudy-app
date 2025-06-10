import {
  Brightness1 as BasicIcon,
  Diamond as ProIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import localeData from "dayjs/plugin/localeData";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import { Avatar } from "@mui/material";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import ja from "dayjs/locale/ja";
import { useState } from "react";
import * as React from "react";
import dayjs from "dayjs";

dayjs.locale(ja);
dayjs.extend(localeData);

import { logout } from "../store/slices/authSlice";
import { getValue } from "../utils/localStorageUtils";
import { colors } from "../constants/theme";

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { userName } = useSelector((state) => state.auth);
  const today = dayjs().format("YYYY年M月D日（ddd）");
  const status = getValue("varsion");

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const getStatusLabel = () => {
    const icon =
      status === 0 ? (
        <BasicIcon fontSize="small" sx={{ color: colors.basic }} />
      ) : (
        <ProIcon fontSize="small" sx={{ color: colors.pro }} />
      );
    const label = status === 0 ? "Basic" : "Pro";

    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        {icon}
        <span>{label}</span>
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{ minHeight: "42px" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {/* {today} */}
          </Typography>
          <Typography>{userName}</Typography>
          <div>
            <IconButton
              size="small"
              aria-controls={anchorEl ? "account-menu" : undefined}
              aria-expanded={anchorEl ? "true" : undefined}
              aria-haspopup="true"
              onClick={handleOpenUserMenu} // メニューを開く
              color="inherit"
              sx={{ pt: 0, pb: 0 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={handleCloseUserMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              slotProps={{
                paper: {
                  elevation: 0,
                  sx: {
                    overflow: "visible",
                    filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  },
                },
              }}
            >
              <MenuItem>{getStatusLabel()}</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                ログアウト
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
