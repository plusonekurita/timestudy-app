import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { showSnackbar } from "../../../store/slices/snackbarSlice";
import { apiFetch } from "../../../utils/api";

const UserListPage = ({ setLoading }) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  // ユーザー一覧を取得するAPI
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/users");
      setUsers(data.map((u) => ({ ...u, password: "" })));
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ユーザー情報を更新する
  const handleChange = (id, field, value) => {
    setUsers(
      users.map((user) => (user.id === id ? { ...user, [field]: value } : user))
    );
  };

  // ユーザー情報を更新するAPI
  const handleUpdate = async (user) => {
    try {
      setLoading(true);
      await apiFetch(`/admin/users/${user.id}`, {
        method: "PUT",
        body: user,
      });
      dispatch(
        showSnackbar({ message: "ユーザーを更新しました", severity: "success" })
      );
      handleChange(user.id, "password", ""); // 入力後に非表示に戻す
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
    }
  };

  // ユーザーを削除するAPI
  const confirmDeleteUser = async () => {
    try {
      setLoading(true);
      await apiFetch(`/admin/users/${targetUserId}`, { method: "DELETE" });
      dispatch(
        showSnackbar({ message: "ユーザーを削除しました", severity: "success" })
      );
      setUsers(users.filter((u) => u.id !== targetUserId));
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: "error" }));
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setTargetUserId(null);
    }
  };

  const requestDelete = (id) => {
    setTargetUserId(id);
    setConfirmOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 1800, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        ユーザー一覧
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>UID</TableCell>
            <TableCell>名前</TableCell>
            <TableCell>パスワード</TableCell>
            <TableCell>バージョン</TableCell>
            <TableCell>操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <TextField
                  value={user.id}
                  InputProps={{ readOnly: true }}
                  sx={{ width: "70px" }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={user.uid}
                  onChange={(e) => handleChange(user.id, "uid", e.target.value)}
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={user.name}
                  onChange={(e) =>
                    handleChange(user.id, "name", e.target.value)
                  }
                />
              </TableCell>
              {/* パスワード */}
              <TableCell>
                <TextField
                  type="text"
                  value={user.password}
                  onChange={(e) =>
                    handleChange(user.id, "password", e.target.value)
                  }
                  placeholder="（変更時に入力）"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={user.version}
                  onChange={(e) =>
                    handleChange(user.id, "version", e.target.value)
                  }
                  sx={{ width: "50px" }}
                  inputProps={{ min: 0, max: 1 }}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleUpdate(user)}
                >
                  更新
                </Button>
                <IconButton
                  color="error"
                  onClick={() => requestDelete(user.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>ユーザー削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当にこのユーザーを削除しますか？この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>キャンセル</Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained">
            削除する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserListPage;
