import "./LeftDrawerMenu.scss";

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Button, Typography, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, } from "@mui/material";
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon, ViewModule as ViewModuleIcon, Logout as LogoutIcon, } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import React, { useState } from "react";

import { managementMenuItems } from "../../constants/drawerMenuItem";
import { getValue } from "../../utils/localStorageUtils";
import { performLogout } from "../../utils/auth";
import LoadingOverlay from "../LoadingOverlay";


const LeftDrawerMenu = ({ onItemSelected }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const user = getValue("user");

  let menuItems;
  menuItems = managementMenuItems(setLoading);
  const handleLogout = () => {
    performLogout(dispatch);
  };

  return (
    <Box className="sidebar">
      <LoadingOverlay loading={loading} />
      <Box className="sidebar__header">
        <Typography variant="h6">{user.office?.name}</Typography>
      </Box>

      <List className="sidebar__nav">
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              navigate("/menu");
              onItemSelected && onItemSelected();
            }}
            className="nav-item"
          >
            <ListItemIcon>
              <ViewModuleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="メニュー" />
          </ListItemButton>
        </ListItem>
        {menuItems.map((item) => (
          <Box key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                selected={activeSection === item.id}
                onClick={() => {
                  setExpandedId(expandedId === item.id ? null : item.id);
                  setActiveSection(item.id);
                }}
                className="nav-item"
                disabled={item.isAdmin ? !user.isAdmin : false}
              >
                <ListItemIcon>
                  <item.icon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={item.label} />
                {expandedId === item.id ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </ListItemButton>
            </ListItem>

            {/* Children */}
            <Collapse in={expandedId === item.id} timeout="auto" unmountOnExit>
              <List component="div" disablePadding className="nav-children">
                {item.children?.map((child) => (
                  <ListItem key={child.id} disablePadding>
                    <ListItemButton
                      selected={activeSection === child.id}
                      onClick={() => {
                        navigate(child.path);
                        onItemSelected && onItemSelected();
                      }}
                      className="child-button"
                    >
                      <ListItemIcon>
                        <child.icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>

      {/* ログアウト */}
      <Box className="sidebar__logout">
        <ListItemButton onClick={() => setOpen(true)} className="nav-item">
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="ログアウト" />
        </ListItemButton>
      </Box>

      {/* ログアウト確認ダイアログ */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>ログアウト確認</DialogTitle>
        <DialogContent>
          <DialogContentText>本当にログアウトしますか？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            いいえ
          </Button>
          <Button onClick={handleLogout} color="primary" variant="contained">
            はい
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeftDrawerMenu;
