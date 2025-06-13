// src/pages/admin/ConnectedUserListPage
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import { Wifi, WifiOff, Refresh as RefreshIcon } from "@mui/icons-material";
import { FormControlLabel, Switch, Button } from "@mui/material";
import React, { useEffect, useState } from "react";

import { apiFetch } from "../../../utils/api";

const ConnectedUserListPage = () => {
  const [connections, setConnections] = useState([]);
  const [showOnlyConnected, setShowOnlyConnected] = useState(false);

  const fetchConnections = async () => {
    try {
      const res = await apiFetch("/admin/active-users");
      setConnections(res.connections || []);
    } catch (error) {
      console.error("接続者一覧の取得に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const isAdminCheck = (uid) => {
    return uid === "admin";
  };

  return (
    <Box sx={{ maxWidth: 1800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        接続中ユーザー一覧
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={fetchConnections}
          startIcon={<RefreshIcon />}
        >
          リロード
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={showOnlyConnected}
              onChange={(e) => setShowOnlyConnected(e.target.checked)}
              color="primary"
            />
          }
          label="接続中のみ"
          sx={{ mb: 1 }}
        />
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>UID</TableCell>
              <TableCell>名前</TableCell>
              <TableCell>状態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {connections
              .filter((user) => !showOnlyConnected || user.is_connected)
              .map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.uid}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>
                    {user.is_connected ? (
                      <Wifi color="success" />
                    ) : (
                      <WifiOff color="disabled" />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.is_connected && !isAdminCheck(user.uid) && (
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={async () => {
                          try {
                            await apiFetch(`/admin/force-logout/${user.uid}`, {
                              method: "POST",
                            });
                            setTimeout(() => {
                              fetchConnections();
                            }, 300);
                          } catch (err) {
                            console.error("切断に失敗しました:", err);
                          }
                        }}
                      >
                        切断
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ConnectedUserListPage;
